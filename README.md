# Kohoutek
This repository houses 2 distinct projects that collectively enable the CodeComet app: the run parsing app - called Pantry - and the frontend website app - called simply "app". You can refer to the respective sections below for an overview of each project, or the following "Getting Started" section for the quickest way to get moving.

### Getting Started
In your terminal navigate to the repo's root directory, then run the following command:
```
./run.sh
```
The above command will do the following:
1. Change to the pantry directory.
2. If no `node_modules` folder is present, run `npm install`.
3. Ingest example protobuf and json files - generated from a CodeComet pipeline run - and use these files to generate data necessary to visualize the run.
4. If cloud upload is enabled, upload the resulting run data to our hosted database.
5. Save the run data to a json file in the app directory.
6. Change to the pantry directory.
7. If no `node_modules` folder is present, run `npm install`.
8. Compile the website app.
9. Start a local web server and open your default browser to visualize the run.

## Pantry

### [Directory Link](https://github.com/codecomet-io/kohoutek/tree/main/pantry)

### Overview
Overview coming soon…

## Kohoutek App

### [Directory Link](https://github.com/codecomet-io/kohoutek/tree/main/app)

### Overview
Overview coming soon…
