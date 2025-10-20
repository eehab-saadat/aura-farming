import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit
from typing import List, Tuple, Dict, Any

TARGET = "sales"
DATE_COL = "date"
HORIZON = 90
SEED = 42
LAGS = [1, 7, 14, 28, 56, 91, 182, 365]
ROLLS = [7, 14, 28, 56]

def create_date_features(df: pd.DataFrame) -> pd.DataFrame:
    """Generate date-related features capturing seasonality and holidays."""
    df["dow"] = df[DATE_COL].dt.weekday
    df["week"] = df[DATE_COL].dt.isocalendar().week.astype(int)
    df["month"] = df[DATE_COL].dt.month
    df["day"] = df[DATE_COL].dt.day
    df["quarter"] = df[DATE_COL].dt.quarter
    df["is_weekend"] = (df["dow"] >= 5).astype(int)
    df["year"] = df[DATE_COL].dt.year
    df["dayofyear"] = df[DATE_COL].dt.dayofyear
    df["sin_day"] = np.sin(2 * np.pi * df["dayofyear"] / 365)
    df["cos_day"] = np.cos(2 * np.pi * df["dayofyear"] / 365)
    return df

def add_lags_rolls(df: pd.DataFrame, lags: List[int], rolls: List[int]) -> pd.DataFrame:
    """Add lag and rolling window features."""
    df = df.copy()
    for lag in lags:
        df[f"lag_{lag}"] = df[TARGET].shift(lag)
    for r in rolls:
        df[f"roll_mean_{r}"] = df[TARGET].shift(1).rolling(r).mean()
        df[f"roll_std_{r}"] = df[TARGET].shift(1).rolling(r).std()
    return df

def load_and_prepare_data(csv_path: str) -> Tuple[pd.DataFrame, List[str]]:
    """Load and prepare data for training."""
    df = pd.read_csv(csv_path)
    df[DATE_COL] = pd.to_datetime(df[DATE_COL])
    df = df.sort_values(DATE_COL).reset_index(drop=True)
    
    full_idx = pd.date_range(df[DATE_COL].min(), df[DATE_COL].max(), freq="D")
    df = df.set_index(DATE_COL).reindex(full_idx).rename_axis(DATE_COL).fillna(method="ffill").reset_index()
    
    df = create_date_features(df)
    df = add_lags_rolls(df, LAGS, ROLLS)
    
    lag_cols = [c for c in df.columns if c.startswith(("lag_", "roll_"))]
    df = df.dropna(subset=lag_cols).reset_index(drop=True)
    
    df["y"] = np.log1p(df[TARGET])
    
    return df, lag_cols

def train_model(df: pd.DataFrame, lag_cols: List[str]) -> Tuple[lgb.Booster, List[str]]:
    """Train the LightGBM model."""
    FEATURES = [
        "dow", "week", "month", "day", "quarter", "is_weekend", "year",
        "sin_day", "cos_day"
    ] + lag_cols
    CATEGORICAL = ["dow", "month", "quarter", "is_weekend"]
    
    last_date = df[DATE_COL].max()
    test_start = last_date - pd.Timedelta(days=HORIZON-1)
    val_start = test_start - pd.Timedelta(days=HORIZON)
    
    train_df = df[df[DATE_COL] < val_start]
    val_df   = df[(df[DATE_COL] >= val_start) & (df[DATE_COL] < test_start)]
    
    train_data = lgb.Dataset(train_df[FEATURES], label=train_df["y"], categorical_feature=CATEGORICAL)
    valid_data = lgb.Dataset(val_df[FEATURES], label=val_df["y"], reference=train_data, categorical_feature=CATEGORICAL)
    
    params = {
        "objective": "regression",
        "metric": "rmse",
        "learning_rate": 0.03,
        "num_leaves": 63,
        "min_data_in_leaf": 60,
        "feature_fraction": 0.9,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "seed": SEED,
        "verbosity": -1,
    }
    
    bst = lgb.train(
        params,
        train_data,
        valid_sets=[train_data, valid_data],
        num_boost_round=5000,
        callbacks=[
            lgb.early_stopping(stopping_rounds=100),
            lgb.log_evaluation(period=100),
        ],
    )
    
    return bst, FEATURES

def recursive_forecast(
    model: lgb.Booster,
    df_recent: pd.DataFrame,
    features: List[str],
    horizon: int = 90,
) -> pd.DataFrame:
    """Generate recursive forecasts for the specified horizon."""
    preds, history = [], list(df_recent[TARGET])
    current_date = df_recent[DATE_COL].iloc[-1]

    for step in range(1, horizon + 1):
        next_date = current_date + pd.Timedelta(days=1)
        row = {
            DATE_COL: next_date,
            "dow": next_date.weekday(),
            "week": int(next_date.isocalendar()[1]),
            "month": next_date.month,
            "day": next_date.day,
            "quarter": next_date.quarter,
            "is_weekend": int(next_date.weekday() >= 5),
            "year": next_date.year,
            "dayofyear": next_date.timetuple().tm_yday,
            "sin_day": np.sin(2 * np.pi * next_date.timetuple().tm_yday / 365),
            "cos_day": np.cos(2 * np.pi * next_date.timetuple().tm_yday / 365),
        }
        for lag in LAGS:
            row[f"lag_{lag}"] = history[-lag] if lag <= len(history) else np.nan
        for r in ROLLS:
            vals = history[-r:] if history else [0]
            row[f"roll_mean_{r}"] = np.mean(vals)
            row[f"roll_std_{r}"] = np.std(vals)
        X = pd.DataFrame([row])[features].fillna(0)
        pred_log = model.predict(X, num_iteration=model.best_iteration)[0]
        pred = float(np.expm1(pred_log))
        preds.append({DATE_COL: next_date, "pred": pred})
        history.append(pred)
        current_date = next_date

    return pd.DataFrame(preds)

def get_demand_forecast(csv_path: str, horizon: int = 90) -> List[Dict[str, Any]]:
    """
    Main function to generate demand forecast.
    
    Args:
        csv_path: Path to the CSV file containing historical sales data
        horizon: Number of days to forecast (default: 90)
    
    Returns:
        List of dictionaries with date and demand predictions.
    """
    # Load and prepare data
    df, lag_cols = load_and_prepare_data(csv_path)
    
    # Train model
    model, features = train_model(df, lag_cols)
    
    # Generate forecast
    forecast_df = recursive_forecast(model, df, features, horizon)
    forecast_df["demand"] = forecast_df["pred"].round().astype(int)
    forecast_df = forecast_df[[DATE_COL, "demand"]]
    forecast_df[DATE_COL] = pd.to_datetime(forecast_df[DATE_COL]).dt.strftime('%Y-%m-%d')
    
    # Convert to list of dictionaries (JSON-serializable)
    return forecast_df.to_dict(orient='records')

# For standalone execution
if __name__ == "__main__":
    import json
    # Default CSV path for standalone execution
    default_csv = "data/daily_sales.csv"
    result = get_demand_forecast(default_csv, HORIZON)
    print(json.dumps(result, indent=2))