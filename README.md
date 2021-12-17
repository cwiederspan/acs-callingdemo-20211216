# ACS Demo

## Building the Images

```bash

# Log into Azure Container Registry
az acr login -n cdwms

# Build the API image
cd api
az acr build -r cdwms -t acsdemo/backend:latest .

# Build the client front-end image
cd client
az acr build -r cdwms -t acsdemo/frontend:latest .

```
