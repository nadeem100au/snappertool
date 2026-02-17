// Main backend logic for Figma Plugin

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 600 });

// Function to handle selection changes
async function checkSelection() {
    const selection = figma.currentPage.selection;

    if (selection.length === 1) {
        const node = selection[0];

        // Check if the node is a frame or component-like structure we can export
        if (
            node.type === 'FRAME' ||
            node.type === 'COMPONENT' ||
            node.type === 'INSTANCE' ||
            node.type === 'GROUP' ||
            node.type === 'SECTION'
        ) {
            try {
                // Export the node to PNG bytes
                const bytes = await node.exportAsync({
                    format: 'PNG',
                    constraint: { type: 'SCALE', value: 2 }, // 2x for better quality
                });

                // Send the bytes to the UI
                figma.ui.postMessage({
                    type: 'preview-image',
                    bytes: bytes,
                    name: node.name
                });
            } catch (err) {
                console.error('Error exporting node:', err);
                figma.ui.postMessage({ type: 'error', message: 'Failed to export selection.' });
            }
        } else {
            figma.ui.postMessage({ type: 'no-selection', message: 'Please select a Frame, Component, or Group.' });
        }
    } else if (selection.length === 0) {
        figma.ui.postMessage({ type: 'no-selection', message: 'Select a frame to preview.' });
    } else {
        figma.ui.postMessage({ type: 'no-selection', message: 'Please select only one frame.' });
    }
}

// Initial check when plugin runs
checkSelection();

// Update checking on selection change
figma.on('selectionchange', () => {
    checkSelection();
});

// Handle messages from UI (if needed, e.g. for resizing window or specific actions)
figma.ui.onmessage = (msg) => {
    if (msg.type === 'close') {
        figma.closePlugin();
    }
    if (msg.type === 'open-url' && msg.url) {
        // Open URL in the user's default browser
        figma.openExternal(msg.url);
    }
    // Add other handlers if UI sends commands back
};
