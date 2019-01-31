/* jshint esversion: 6 */

const VERSION = 'v1.0.1';
const SERVER_URL = 'https://localhost/extract';
const DOWNLOAD_DELAY = 150;

const DOWNLOAD_ALL_UI = `
<div style='position: fixed; top: 1em; left: 1em;'>
    <button id="downloadAll">Download All</button>
</div>
`;

const DOWNLOAD_TOKEN_UI = `
<div>
    <a href="#" class="download">Download</a>
    <span class='downloadStatus'><span>
</div>
`;

$(() => {
    'use strict';

    let ASSETS_DOM = $(".marketplacelistingitem");

    if (AddScript()) {
        LoadUI();

        $('body').on('click', 'a.download', DownloadToken);
        $('body').on('click', 'button#downloadAll', DownloadAllTokenTokens);

        console.debug(`Token Extractor added: version: ${VERSION}`);
    } else {
        console.error('Failed to load extractor');
    }

    //////////////////////////////

    function AddScript() {
        return (ASSETS_DOM.length > 0);
    }

    function LoadUI() {
        $('body').prepend(DOWNLOAD_ALL_UI);
        ASSETS_DOM.each((i, e) => {
            $(e).prepend(DOWNLOAD_TOKEN_UI);
        });
    }

    function DownloadToken(e) {
        e.preventDefault();

        let parentDOM = $(e.currentTarget).parent().parent();
        let tokenPack = $("div.titlecard h2").text().trim();
        let tokenName = parentDOM.find('div.desc em').text().trim();
        let imageUrl = parentDOM.find("div.inneritem a.lightly")[0].href;
        let tokenTags = parentDOM.attr('original-title');

        let payload = {
            'tokenPack': tokenPack,
            'tokenName': tokenName,
            'imageUrl': imageUrl,
            'tokenTags': tokenTags
        };

        console.debug(`[START] Downloading token: ${tokenName}`);
        parentDOM.find('span.downloadStatus').text('Downloading...');
        parentDOM.find('a.download').hide();

        $.post(SERVER_URL, payload).done((data) => {
            parentDOM.find('span.downloadStatus').text('Downloaded');
            parentDOM.find('span.downloadStatus').css('color', 'green');

            console.debug(`[DONE] Downloaded token: ${tokenName}`);
        }).fail((err) => {
            parentDOM.find('span.downloadStatus').text('Failed');
            parentDOM.find('span.downloadStatus').css('color', 'red');

            console.debug(`[DONE] Failed to donwload token: ${tokenName}`);
        });
    }

    function DownloadAllTokenTokens(e) {
        e.preventDefault();
        console.debug('[START] Downloading all tokens of this page.');

        ASSETS_DOM.each((i, e) => {
            setTimeout(() => {
                $(e).find('div a.download').click();
            }, DOWNLOAD_DELAY);
        });
    }

});

/*
[TOKEN]
	$("div.titlecard h2").text().trim();
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