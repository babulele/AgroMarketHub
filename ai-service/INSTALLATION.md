# AI Service Installation Guide

## Quick Start (Recommended)

Install only the base dependencies (works immediately, no large downloads):

```bash
pip install -r requirements.txt
```

This installs all packages needed for the current implementation, which uses:
- FastAPI for the API
- NumPy/Pandas for data processing
- Scikit-learn for basic ML operations
- Motor (async MongoDB driver) >= 3.7.0 (compatible with pymongo 4.x)
- Redis for caching

## ML Dependencies (Optional - For Future Implementation)

The current codebase does NOT use TensorFlow or Prophet yet. These are planned for future ML model implementation.

If you want to install them now (for future development):

```bash
# Increase timeout to handle large downloads (300+ MB)
pip install --default-timeout=1000 -r requirements-ml.txt
```

**Note:** 
- TensorFlow is ~300MB and may take 10-20 minutes to download
- Prophet requires system dependencies (C++ compiler on Windows)
- These are NOT required for the MVP to function

## Troubleshooting

### Motor/PyMongo Version Compatibility Error

If you see an error like:
```
ImportError: cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'
```

This is a version compatibility issue. Fix it by upgrading motor:
```bash
pip install --upgrade motor
```

The requirements.txt now specifies `motor>=3.7.0` which is compatible with pymongo 4.x.

### Timeout Errors
If you get timeout errors when installing ML packages:
```bash
pip install --default-timeout=1000 --upgrade pip
pip install --default-timeout=1000 -r requirements-ml.txt
```

### Prophet Installation Issues (Windows)
Prophet requires Visual C++ Build Tools on Windows:
1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++" workload
3. Then retry: `pip install prophet`

### Alternative: Use CPU-only TensorFlow
If TensorFlow download is too slow, use the lighter CPU-only version:
```bash
pip install tensorflow-cpu==2.15.0
```

