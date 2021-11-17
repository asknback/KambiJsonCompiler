figma.showUI(__html__, { width: 320, height: 320 });
figma.ui.onmessage = msg => {
    if (msg.type === 'alert-me') {
        console.log("ALERT ME");
    }
    else {
        console.log("STOP THIS");
        figma.closePlugin();
    }
};
