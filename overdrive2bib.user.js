// ==UserScript==
// @name            Overdrive2Bib
// @namespace       bib
// @version         0.1
// @description     a simple bibliotik upload form filler
// @author          wet2
// @grant   	    GM.deleteValue
// @grant           GM.getValue
// @grant           GM.setValue
// @grant           GM.setClipboard
// @grant           GM.xmlhttpRequest
// @include	        http*://*.overdrive.com/*
// @include         https://bibliotik.me/upload/ebooks
// @include	        http*://*.overdrive.com/account/settings
// @include	        http*://*.overdrive.com/collection/*
// @include	        http*://*.overdrive.com/collections/*/*
// @include	        http*://*.overdrive.com/creators/*/*
// @include	        http*://*.overdrive.com/media/*/*
// @include	        http*://*.overdrive.com/search*
// @include	        http*://*.overdrive.com/subjects*
// @include	        http*://*.libraryreserve.com/*/*/MyAccount*
// @include	        http*://*.libraryreserve.com/*/*/*/MyAccount*
// @include	        http*://*.libraryreserve.com/*/*/*/MyCompleteWishList*
// @include	        http*://*.libraryreserve.com/*/*/*/WaitingListForm*
// @include	        http*://*.libraryreserve.com/*/*/*/*/ContentDetails*
// @include	        http*://*.libraryreserve.com/*/*/*/*/Default*
// @include	        http*://*.libraryreserve.com/*/*/*/*/SearchResults*
// @include	        http*://*.lib.overdrive.com/*/*/*/*/ContentDetails*
// @include	        http*://*.lib.overdrive.com/*/*/*/*/Default*
// @include	        http*://*.lib.overdrive.com/*/*/*/*/SearchResults*
// @include	        http*://*.live-brary.com/*/*/*/*/Default*
// @include	        http*://*.live-brary.com/*/*/*/*/SearchResults*
// @include	        http*://*.live-brary.com/*/*/*/*/ContentDetails*
// @include	        http*://*.*.org/*/*/*/*/ContentDetails*
// @include	        http*://*.*.org/*/*/*/*/Default*
// @include	        http*://*.*.org/*/*/*/*/SearchResults*
// @include	        http*://*.*.org/*/*/*/*/WaitingListForm*
// @require         https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require         https://leeoniya.github.io/reMarked.js/reMarked.js
// ==/UserScript==


//Creators > 1
function getCreators() {
    var authors = [];
    var illustrators = [];
    var publisher;

    var items = document.getElementsByClassName("TitleDetailsDescription-creatorLink");
    for (var i = 0; i < items.length; i++) {
        ele = items[i];
        if (ele.getAttribute("title") == "Author") {
            authors.push(ele.innerHTML);
        } else if (ele.getAttribute("title") == "Illustrator") {
            illustrators.push(ele.innerHTML);
        } else {
            publisher = ele.innerHTML;
        }
    }
    return [authors, illustrators, publisher];
}

//Creator = 1
function getCreator() {
    var ele = document.getElementsByClassName("TitleDetailsHeading-creatorLink secondary-color")[0];
    var author = ele.innerHTML;

    var ele = document.getElementsByClassName("TitleDetailsDescription-creatorLink")[0];
    var publisher = ele.innerHTML;
    return [author, publisher];
}

//getTitle need some fix
function getTitle() {
    var mainTitle = document.getElementsByClassName("TitleDetailsHeading-title")[0].innerHTML;
    var series, subTitle;
    var title = mainTitle;

    var subtitleElement = document.getElementsByClassName("TitleDetailsHeading-subtitleSeries");
    var seriesElement = document.getElementsByClassName("TitleDetailsHeading-seriesLink");
    if (subtitleElement.length !== 0 && seriesElement.length === 0) {
        subTitle = subtitleElement[0].innerHTML.trim();
        title = title + ": " + subTitle;
    }
    if (seriesElement.length !== 0) {
        series = seriesElement[0].innerHTML.trim();
        title = title + " (" + series + ")";
    }
    return title;
}

//get an ISBN and a year.
//Note: only support 4-digit year
function getISBN() {
    var ISBN, year;
    var m = document.getElementsByTagName("li");
    for ( var i = 0; i < m.length; i++) {
        var ele = m[i].getAttribute("aria-label");
        if ( ele !== null && ele.substring(0,4) == "ISBN") {
            ISBN = ele.substring(6);
        }
        if ( ele !== null && ele.substring(0,7) == "Release"){
            year = ele.substring( ele.length - 4);
        }
    }
    return [ISBN, year];
}

function getTags() {
    var tags = [];
    var ele = document.getElementsByClassName("button outline round TitleDetailsSidebar-subjectButton u-allCaps");
    for (var i = 0; i < ele.length; i++) {
        tags.push(ele[i].innerHTML);
    }
    return tags.join(", ");
}

function getIMG() {
    var ele = document.getElementsByClassName("large-title js-details-cover-image")[0];
    var imgurl = ele.getAttribute("src");
    return imgurl;
}

function getDescription() {
    var ele = document.getElementsByClassName("TitleDetailsDescription-description js-title-description is-long")[0];
    if(ele === undefined){
        ele = document.getElementsByClassName("TitleDetailsDescription-description is-short js-title-description")[0];
    }
    var toConvert = ele.innerHTML.trim();
    var reMarker = new reMarked();
    var converted = reMarker.render(toConvert);
    //var converted = toConvert;
    return converted;
}

function setBookInfo() {
    var title = getTitle();
    var authors = "";
    var contributers = "";
    var publisher = "";

    if(document.getElementById("creators") === null){
        authors = getCreator()[0];
        publisher = getCreator()[1];
    } else {
        var result = getCreators();
        for (var i = 0; i < result[0].length; i++) {
            authors = result[0].join(",");
        }
        for (var i = 0; i < result[1].length; i++) {
            contributers = result[1].join(",");
        }
        publisher = result[2];
    }


    var ISBN = getISBN()[0];
    var year = getISBN()[1];
    var tags = getTags();
    var image = getIMG();
    var description = getDescription();

    GM.setValue("title", title);
    GM.setValue("authors", authors);
    GM.setValue("contributers", contributers);
    GM.setValue("publisher", publisher);
    GM.setValue("ISBN", ISBN);
    GM.setValue("year", year);
    GM.setValue("tags", tags);
    GM.setValue("image", image);
    GM.setValue("description", description);
    //console.log(description);
    GM.setClipboard(description);

    console.log(title + authors + contributers + publisher + ISBN + year + tags + image);

}

function createUpload() {
/*     document.getElementById("TitleField").value = GM.getValue("title");
    document.getElementById("AuthorsField").value = GM.getValue("authors");
    if(GM.getValue("contributers") !== "undefined") {
        document.getElementById("toggle").click();
        document.getElementById("creatorOptions").setAttribute("style", "display: table-row-group;");
    }
    document.getElementById("PublishersField").value = GM.getValue("publisher");
    document.getElementById("IsbnField").value = GM.getValue("ISBN");
    document.getElementById("YearField").value = GM.getValue("year");
    document.getElementById("TagsField").value = GM.getValue("tags");
    document.getElementById("ImageField").value = GM.getValue("image");
    document.getElementById("DescriptionField").value = GM.getValue("description"); */
    GM.getValue("title").then( function(value){
        document.getElementById("TitleField").value = value;
    });
    GM.getValue("authors").then( function(value){
        document.getElementById("AuthorsField").value = value;
    });
    GM.getValue("contributers").then( function(value){
        if(value !== undefined){
            document.getElementById("toggle").click();
            document.getElementById("ContributorsField").value = value;
        }
    });
    GM.getValue("publisher").then( function(value){
        document.getElementById("PublishersField").value = value;
    });
    GM.getValue("ISBN").then( function(value){
        document.getElementById("IsbnField").value = value;
    });
    GM.getValue("year").then( function(value){
        document.getElementById("YearField").value = value;
    });
    GM.getValue("tags").then( function(value){
        document.getElementById("TagsField").value = value;
    });
    GM.getValue("image").then( function(value){
        document.getElementById("ImageField").value = value;
    });
    GM.getValue("description").then( function(value){
        document.getElementById("DescriptionField").value = value;
    });


    document.getElementById("FormatField").value = 15;
    document.getElementById("RetailField").checked = true;
    document.getElementById("AnonymousField").checked = true;
    document.getElementById("NotifyField").checked = false;
    console.log("creatUpload function works.");

    GM.deleteValue("title");
    GM.deleteValue("authors");
    GM.deleteValue("contributers");
    GM.deleteValue("publisher");
    GM.deleteValue("ISBN");
    GM.deleteValue("year");
    GM.deleteValue("tags");
    GM.deleteValue("image");
    GM.deleteValue("description");
}

if (window.location.hostname == "ohdbks.overdrive.com"){
    document.getElementsByClassName("availability")[0].outerHTML = ' <a target="_blank" class="bib" href="https://bibliotik.me/upload/ebooks"> Up' + '</a>' ;
    setBookInfo();
//    $(document.body).on("click", ".bib", getBookInfo);
}
if (window.location.hostname == "bibliotik.me") {
    createUpload();
}