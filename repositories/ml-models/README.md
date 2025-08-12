# ML Models

Machine Learning models and training pipelines for AI-Whisperers.

## Overview

This repository contains all machine learning models, training pipelines, and inference services for the AI-Whisperers platform.

## Tech Stack

- **Languages**: Python 3.11+
- **ML Frameworks**: PyTorch, TensorFlow, Scikit-learn
- **Data Processing**: Pandas, NumPy, Polars
- **Experiment Tracking**: MLflow, Weights & Biases
- **Model Serving**: TorchServe, TensorFlow Serving, FastAPI
- **Infrastructure**: Docker, Kubernetes, AWS SageMaker

## Project Structure

```
ml-models/
├── models/            # Trained model artifacts
├── notebooks/         # Jupyter notebooks for exploration
├── src/
│   ├── data/          # Data processing and loading
│   ├── training/      # Training scripts and pipelines
│   ├── evaluation/    # Model evaluation and metrics
│   └── inference/     # Inference and serving code
├── datasets/          # Dataset references and samples
├── experiments/       # Experiment tracking and results
└── configs/           # Configuration files
```

## Getting Started

### Prerequisites

- Python 3.11+
- CUDA 11.8+ (for GPU support)
- Docker
- Git LFS (for large files)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Ai-Whisperers/ml-models.git
cd ml-models
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

4. Setup Git LFS for large files:
```bash
git lfs install
git lfs pull
```

5. Configure environment:
```bash
cp .env.example .env
```

## Model Development Workflow

### 1. Data Preparation

```python
from src.data import DataLoader, Preprocessor

# Load and preprocess data
loader = DataLoader(config_path="configs/data_config.yaml")
data = loader.load_dataset("dataset_name")
preprocessor = Preprocessor()
processed_data = preprocessor.transform(data)
```

### 2. Model Training

```bash
# Train a model using configuration
python src/training/train.py --config configs/model_config.yaml

# Resume training from checkpoint
python src/training/train.py --resume checkpoints/model_epoch_10.pt
```

### 3. Evaluation

```bash
# Evaluate model performance
python src/evaluation/evaluate.py --model models/best_model.pt --dataset test

# Generate evaluation report
python src/evaluation/report.py --experiment exp_001
```

### 4. Inference

```python
from src.inference import ModelServer

# Load model for inference
server = ModelServer(model_path="models/production_model.pt")
predictions = server.predict(input_data)
```

## Available Models

| Model | Task | Performance | Status |
|-------|------|-------------|--------|
| TextClassifier-v1 | Text Classification | 95.2% accuracy | Production |
| ImageSegmentation-v2 | Image Segmentation | 89.7% mIoU | Testing |
| TimeSeriesForecaster | Time Series | 2.3% MAPE | Development |
| RecommenderSystem | Recommendations | 0.82 AUC | Production |

## Training Scripts

### Basic Training

```bash
# Classification model
python train_classifier.py \
  --data data/train.csv \
  --model resnet50 \
  --epochs 100 \
  --batch-size 32

# NLP model
python train_nlp.py \
  --data data/text_corpus \
  --model bert-base \
  --learning-rate 2e-5
```

### Distributed Training

```bash
# Multi-GPU training
torchrun --nproc_per_node=4 train_distributed.py

# Horovod training
horovodrun -np 4 python train_horovod.py
```

## Experiment Tracking

### MLflow

```bash
# Start MLflow UI
mlflow ui --host 0.0.0.0 --port 5000

# Track experiments
export MLFLOW_TRACKING_URI=http://localhost:5000
python train.py --experiment-name "exp_001"
```

### Weights & Biases

```python
import wandb

wandb.init(project="ai-whisperers", name="experiment_001")
wandb.config.update({"learning_rate": 0.001, "epochs": 100})
wandb.log({"loss": loss, "accuracy": accuracy})
```

## Model Serving

### FastAPI Server

```bash
# Start model server
uvicorn src.inference.api:app --host 0.0.0.0 --port 8080

# Make predictions
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{"input": "sample text"}'
```

### Docker Deployment

```bash
# Build Docker image
docker build -t ai-whisperers/ml-model:latest .

# Run container
docker run -p 8080:8080 ai-whisperers/ml-model:latest
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-server
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: model-server
        image: ai-whisperers/ml-model:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
            nvidia.com/gpu: 1
```

## Testing

```bash
# Run all tests
pytest tests/

# Run specific test suite
pytest tests/test_models.py

# Run with coverage
pytest --cov=src tests/

# Run integration tests
pytest tests/integration/
```

## Performance Benchmarks

### Inference Latency

| Model | CPU (ms) | GPU (ms) | Batch Size |
|-------|----------|----------|------------|
| TextClassifier | 12.3 | 2.1 | 32 |
| ImageSegmentation | 145.6 | 18.4 | 8 |
| TimeSeriesForecaster | 8.7 | 1.9 | 64 |

### Training Performance

| Model | Time/Epoch | GPU Memory | Convergence |
|-------|------------|------------|-------------|
| BERT-base | 45 min | 12 GB | 20 epochs |
| ResNet-50 | 30 min | 8 GB | 50 epochs |
| LSTM | 15 min | 4 GB | 100 epochs |

## Data Pipeline

```python
# Example data pipeline
from src.data.pipeline import Pipeline

pipeline = Pipeline()
pipeline.add_step(LoadData("s3://bucket/data"))
pipeline.add_step(CleanData(remove_nulls=True))
pipeline.add_step(FeatureEngineering(features=["tfidf", "embeddings"]))
pipeline.add_step(SplitData(test_size=0.2))
pipeline.add_step(SaveData("processed/"))

pipeline.run()
```

## Model Registry

Models are versioned and stored in our model registry:

```python
from src.registry import ModelRegistry

registry = ModelRegistry()

# Register a new model
registry.register(
    name="text_classifier",
    version="2.0.1",
    path="models/text_classifier_v2.pt",
    metrics={"accuracy": 0.95, "f1": 0.93},
    tags=["production", "nlp"]
)

# Load a model from registry
model = registry.load("text_classifier", version="latest")
```

## Contributing

Please read our [Contributing Guide](https://github.com/Ai-Whisperers/documentation/blob/main/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is proprietary and confidential.