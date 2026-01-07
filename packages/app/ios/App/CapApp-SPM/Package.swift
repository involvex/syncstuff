// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "6.2.1"),
        .package(name: "CapacitorMlkitBarcodeScanning", path: "..\..\..\..\..\node_modules\.bun\@capacitor-mlkit+barcode-scanning@6.2.0+6ca06047b899f7ea\node_modules\@capacitor-mlkit\barcode-scanning"),
        .package(name: "CapacitorApp", path: "..\..\..\..\..\node_modules\.bun\@capacitor+app@6.0.3+6ca06047b899f7ea\node_modules\@capacitor\app"),
        .package(name: "CapacitorClipboard", path: "..\..\..\..\..\node_modules\.bun\@capacitor+clipboard@6.0.3+6ca06047b899f7ea\node_modules\@capacitor\clipboard"),
        .package(name: "CapacitorDevice", path: "..\..\..\..\..\node_modules\.bun\@capacitor+device@6.0.3+6ca06047b899f7ea\node_modules\@capacitor\device"),
        .package(name: "CapacitorFilesystem", path: "..\..\..\..\..\node_modules\.bun\@capacitor+filesystem@6.0.4+6ca06047b899f7ea\node_modules\@capacitor\filesystem"),
        .package(name: "CapacitorHaptics", path: "..\..\..\..\..\node_modules\.bun\@capacitor+haptics@6.0.3+6ca06047b899f7ea\node_modules\@capacitor\haptics"),
        .package(name: "CapacitorKeyboard", path: "..\..\..\..\..\node_modules\.bun\@capacitor+keyboard@6.0.4+6ca06047b899f7ea\node_modules\@capacitor\keyboard"),
        .package(name: "CapacitorNetwork", path: "..\..\..\..\..\node_modules\.bun\@capacitor+network@6.0.4+6ca06047b899f7ea\node_modules\@capacitor\network"),
        .package(name: "CapacitorStatusBar", path: "..\..\..\..\..\node_modules\.bun\@capacitor+status-bar@6.0.3+6ca06047b899f7ea\node_modules\@capacitor\status-bar"),
        .package(name: "CapacitorZeroconf", path: "..\..\..\..\..\node_modules\.bun\capacitor-zeroconf@3.0.0+13fa2e69324dedc6\node_modules\capacitor-zeroconf")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorMlkitBarcodeScanning", package: "CapacitorMlkitBarcodeScanning"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorClipboard", package: "CapacitorClipboard"),
                .product(name: "CapacitorDevice", package: "CapacitorDevice"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorNetwork", package: "CapacitorNetwork"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapacitorZeroconf", package: "CapacitorZeroconf")
            ]
        )
    ]
)
