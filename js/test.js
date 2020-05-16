let touchControl = new TouchControl(lift, move, look);


requestAnimationFrame(animate)

function animate() {
    requestAnimationFrame(animate);
    if (!touchControl.lookMoved) {
        touchControl.offsetXYLook.x=0
        touchControl.offsetXYLook.y=0
    }
    logStatus.innerHTML = `
    lift y= ${touchControl.offsetXYLift.y}<br><br>
    move x= ${touchControl.offsetXYMove.x}<br> 
    move y= ${touchControl.offsetXYMove.y}<br><br>
    look x= ${touchControl.offsetXYLook.x}<br>
    look y= ${touchControl.offsetXYLook.y}<br>
    `;
    touchControl.lookMoved = false;
}