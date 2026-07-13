# ahm-asset-receiving-sync

A lightweight mobile asset for [Android Hybrid Mobile](https://github.com/otvnvs/android-hybrid-mobile) designed to fetch incoming palette manifests, verify items via barcode scanning, and synchronize results back to the server.


![Download Link](/qr.png)

[Launch in Asset Delivery Scanner](https://weiserman.github.io/ahm-gr-scanner-light-mode/)


**Direct Install Link:** [Install in AHM App](ahm-app://deploy?package_url=https://github.com/weiserman/ahm-gr-scanner-light-mode/archive/refs/heads/main.zip)

## Features

* **3-Tile Dashboard**: Clean home screen interface for rapid warehouse navigation.
* **API Delivery Pull**: Performs a server API call to fetch live palette manifests and expected item counts.
* **Barcode Verification**: Scans physical barcodes to cross-check delivery accuracy and stores records in a local outbox.
* **API Sync Outbox**: Performs a server API call to push verified outbox logs back to the database.

---

## Screen Workflow

### 1. Pull Deliveries (Tile 1)
* Triggers an HTTP API call to fetch the latest palette item manifests.
* Populates the local system with expected delivery data.

### 2. Verify & Scan (Tile 2)
* Provides a camera/scanner interface to scan barcodes on physical packages.
* Compares scanned values against the fetched manifest.
* Saves successful verifications directly into an internal outbox queue.

### 3. Sync Outbox (Tile 3)
* Displays all pending verifications currently stored in the outbox.
* Triggers a bulk HTTP API call to transmit completed data back to the server.

---

## Installation & Deployment

This project is built using standard web technologies and is structured to be consumed natively by the AHM shell application.

### RUnning

The project can be served up using a standard web server, `index.html` will bootstrap the SFC version of the application.

You can use the following to run in SFC mode:

* `npm run serve` : serve root directory 

You can also run it using vite. Install as follows

```bash
npm install
```

With the dependencies installed you can use the following to run and build the project:

* `npm run vite:start` : development
* `npm run vite:preview` : production testing
* `npm run vite:dist` : production preparation


### Production Package
Ensure the output bundle is zipped and hosted on GitHub Releases or a accessible repository link for the [Android Hybrid Mobile](https://github.com/otvnvs/android-hybrid-mobile) app to pull down, unzip, and render natively. Simply enter the repository zip download link (`https://github.com/otvnvs/ahm-asset-odata-client/archive/refs/heads/main.zip`) in the maintenance screen and hit update.
