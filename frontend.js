/* jshint esversion: 6 */

const UI = `
<div id="filterManager" style="position: fixed; top:1em; left: 1em; border: 1px solid black">
    <div>
        Show All: <input type="checkbox" id="toggleAssetsView" />
    </div>

    <div id="downloadSettings">
        <label for="assetName">Name:</label> <span id="assetName"></span>
        <br />
        <span>Tags:</span>
        <br />
        <ul id="assetTags"></ul>
        <br />
        <select id="newTagSelect" name="newTagSelect">
            <option value="" selected disabled>Select a tag</option>
        </select>
        <br />
        <input type="text" placeholder="Custom tag" id="customTag" />
        <button id="addCustomTag">Add</button>
        <br />
        <button id="downloadAsset">Download</button>
    </div>
</div>
`;

const DOWNLOAD_BUTTON = `<a href="#" id="download">Download</a>`;

$(() => {
    'use strict';

    const ASSETS_LIST_KEY = 'AssetList';
    let ASSETS_DOM = $(".marketplacelistingitem");
    let ASSETS = {};


    // [1] Load UI
    if (AddScript()) {
        LoadUI();

        // [2] Add event for "Show all" and 'Download'
        $('body').on('change', '#toggleAssetsView', ToggleAssetList);
        $('body').on('click', '#download', DownloadToken);

        // [3] Load Asset Data from local storage
        LoadAssetData();
    }

    //////////////////////////////

    function AddScript() {
        return (ASSETS_DOM.length > 0);
    }

    function LoadUI() {
        $('body').append(UI);
        $('#downloadSettings').hide();

        ASSETS_DOM.each((i, e) => {
            $(e).prepend(DOWNLOAD_BUTTON);
        });
    }

    // TODO: Implement
    function ToggleAssetList(e) {
        let checked = e.target.checked;
        console.log('checked:', checked);
    }

    function LoadAssetData() {
        let assets = JSON.parse(localStorage.getItem(ASSETS_LIST_KEY));
        if (typeof assets === 'object') {
            console.log('assset', assets);
            ASSETS = assets;
            // [4] Iterate list and hide assets that are tagged as hidden
        } else {
            throw 'Invalid data from local storage';
        }
    }

    function DownloadToken(e) {
        e.preventDefault();
        const EXTRACT_URL = 'http://localhost:3000/extract';

        let parentDOM = $(e.currentTarget).parent();
        const tokenPack = $("h1.setname").text().trim();
        const tokenName = parentDOM.find('div.desc em').text().trim();
        const imageUrl = parentDOM.find("div.inneritem a.lightly")[0].href;
        const tokenTags = parentDOM.attr('original-title');

        let payload = {
            'tokenPack': tokenPack,
            'tokenName': tokenName,
            'imageUrl': imageUrl,
            'tokenTags': tokenTags
        };
        $.post(EXTRACT_URL, payload).done((data) => {
            alert("File downloaded");
        });
        // $('#downloadSettings').show();
    }

});


/*
[TOKEN]
	$("h1.setname").text().trim();
		Devin Token Pack 45 - Heroic Characters 1

[TOKEN NAME]
	$($("div.desc em")[0]).text().trim();
        Dwarf_Male_Fighter2
        
[IMAGE URI]
	$("div.inneritem a.lightly")[0].href
		https://s3.amazonaws.com/files.d20.io/marketplace/24475/T-WjDkHpIdZUQuZUB8YPHw/max.png?1375971198
		
[Tags]
	$($("div.marketplacelistingitem")[0]).attr('original-title');
		"shield axe dwarf token NPC PC character fantasy token fantasy"
*/