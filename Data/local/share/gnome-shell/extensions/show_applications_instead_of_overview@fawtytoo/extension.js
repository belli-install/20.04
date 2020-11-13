const Main = imports.ui.main;
const Overview = imports.ui.overview;

let oldOverview;
let oldLabel;

function overviewToggle()
{
    if (this.isDummy)
        return;

    if (this.visible)
        this.hide();
    else
        this.viewSelector.showApps();
}

function enable()
{
    oldOverview = Overview.Overview.prototype['toggle'];
    Overview.Overview.prototype['toggle'] = overviewToggle;
}

function disable()
{
    Overview.Overview.prototype['toggle'] = oldOverview;
}
