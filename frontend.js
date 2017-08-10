/* jshint esversion: 6 */

const EXTRACTOR_UI = `
<div>
    <a href="#" class="download">Download</a>
    <span class='downloadStatus'><span>
</div>
`;

$(() => {
    'use strict';

    const SERVER_URL = 'http://localhost:3000/extract';
    let ASSETS_DOM = $(".marketplacelistingitem");

    if (AddScript()) {
        LoadUI();
        $('body').on('click', '.download', DownloadToken);
    } else {
        alert('Failed to load extractor');
    }

    //////////////////////////////

    function AddScript() {
        return (ASSETS_DOM.length > 0);
    }

    function LoadUI() {
        ASSETS_DOM.each((i, e) => {
            $(e).prepend(EXTRACTOR_UI);
        });
    }

    function DownloadToken(e) {
        e.preventDefault();

        let parentDOM = $(e.currentTarget).parent().parent();
        let tokenPack = $("h1.setname").text().trim();
        let tokenName = parentDOM.find('div.desc em').text().trim();
        let imageUrl = parentDOM.find("div.inneritem a.lightly")[0].href;
        let tokenTags = parentDOM.attr('original-title');

        let payload = {
            'tokenPack': tokenPack,
            'tokenName': tokenName,
            'imageUrl': imageUrl,
            'tokenTags': tokenTags
        };

        parentDOM.find('span.downloadStatus').text('Downloading...');
        parentDOM.find('a.download').hide();

        $.post(SERVER_URL, payload).done((data) => {
            parentDOM.find('span.downloadStatus').text('Downloaded');
        });
    }

});

/*
[TOKEN]
	$("h1.setname").text().trim();
		=> ex. "Devin Token Pack 45 - Heroic Characters 1"

[TOKEN NAME]
	$($("div.desc em")[0]).text().trim();
        => ex. "Dwarf_Male_Fighter2"
        
[IMAGE URI]
	$("div.inneritem a.lightly")[0].href
		=> ex. "https://s3.amazonaws.com/files.d20.io/marketplace/24475/T-WjDkHpIdZUQuZUB8YPHw/max.png?1375971198"
		
[Tags]
	$($("div.marketplacelistingitem")[0]).attr('original-title');
		=> ex. "shield axe dwarf token NPC PC character fantasy token fantasy"
*/