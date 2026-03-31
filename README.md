# CAMERA T-1 Interactive Map

An interactive map and gallery project visualising geographic image archives. This project consists of a front-end web application for the interactive map and gallery view, along with Python scripts for data processing and categorization.

## Features

- **Interactive Map (`index.html`)**: A map interface displaying image locations and popup previews.
- **Gallery View (`gallery_view.html`)**: A detailed gallery view of the collected images with museum links and metadata.
- **Data Processing Scripts**: Python scripts used to parse gallery data and categorize image archives.

## Directory Structure

- `assets/`: Contains project images and media files.
- `css/`: Stylesheets for the interactive map and gallery.
- `js/`: JavaScript source code for map functionality and interactivity.
- `index.html`: Main entry point for the interactive map interface.
- `gallery_view.html`: Alternative gallery view of the archives.
- `parse_gallery.py`: Python script for processing gallery data.
- `categorize_archives.py`: Python script for categorizing image archives.
- `*.csv` / `*.json`: Extracted image data files.

## Local Development

To run this project locally, start a local HTTP server in the root directory:

```bash
python -m http.server
```

Then, open your web browser and navigate to `http://localhost:8000`.
