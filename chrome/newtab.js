window.onblur = function() {
    hidePopupFunction(popupisshow);
    popupisshow = null;

    removeMenu();

    console.log("window.onblur");
}
window.onload = function() {
    document.title=chrome.i18n.getMessage('newTab');
    if (window.devicePixelRatio == 2) {
        document.body.style.backgroundSize='500px 169px';
    } else {
        document.body.style.backgroundSize='1000px 338px';
    }
}
window.oncontextmenu = function(e) {
    e.preventDefault();
}
document.body.onclick = function(e) {
    var target = e.target;
    if (target.tagName == 'BODY') {
        hidePopupFunction(popupisshow);
        popupisshow = null;
    }
}

function createTag(name) {
    return document.createElement(name);
}

var hColor = '#d0d0d0';
var popupisshow;

function updateTabLocation(url) {
    chrome.tabs.update({url});
}

function removeMenu() {
    var div_menu = document.getElementById('div_menu');
    div_menu.style.display="none";
}

function bindOnClickFunction(li, src) {
    var className = li.getAttribute('class');
    if (className == 'site') {
        li.onclick = function() {
            updateTabLocation(src);
        }
        if (src.indexOf('chrome://') == 0) {
            return ;
        }
        li.oncontextmenu = function(e) {
            e.preventDefault();
            var div_menu = document.getElementById('div_menu');
            div_menu.style.display="block";
            div_menu.onclick = function() {
                li.style.background='';
                removeMenu();
            };
            div_menu.oncontextmenu = function() {
                li.style.background='';
                removeMenu();
            };

            li.style.background=hColor;
            var menuList = document.getElementById('menuList');
            if (menuList.children.length == 0) {
                var item = createTag('li');
                var span=createTag('span');
                span.innerText=chrome.i18n.getMessage('openInNewTab');
                item.appendChild(span);
                item.onclick = function() {chrome.tabs.create({url: src});};
                menuList.appendChild(item);
                
                menuList.appendChild(createTag('hr'));
                
                var item = createTag('li');
                var span=createTag('span');
                span.innerText=chrome.i18n.getMessage('openInNewWindow');
                item.appendChild(span);
                item.onclick = function() {chrome.windows.create({url: src,incognito: false});};
                menuList.appendChild(item);
                var item = createTag('li');
                var span=createTag('span');
                span.innerText=chrome.i18n.getMessage('openInIncognitoWindow');
                item.appendChild(span);
                item.onclick = function() {chrome.windows.create({url: src,incognito: true});};
                menuList.appendChild(item);

                /*menuList.appendChild(createTag('hr'));
                
                var item = createTag('li');
                var span=createTag('span');
                span.innerText='删除';
                item.appendChild(span);
                item.onclick = function() {chrome.windows.create({url: src,incognito: true});};
                menuList.appendChild(item);*/
            }

            var p = document.getElementById('div_menu_context');
            p.style.left = e.pageX + p.clientWidth > window.innerWidth ? window.innerWidth - p.clientWidth - 4 + 'px': e.pageX + 'px';
            p.style.top = e.pageY + p.clientHeight > window.innerHeight ? (e.pageY - p.clientHeight < 0) ? window.innerHeight - p.clientHeight - 4 + 'px': e.pageY - p.clientHeight + 'px': e.pageY + 'px';
        }
    } else if (className == 'folder') {
        li.onclick = function(){
            var popup = document.getElementById('div_popup');
            if (popup.style.display != "block") {
                showPopupFunction(this, src);
                popupisshow = this;
                
                movePopupFunction(this);
            } else {
                hidePopupFunction(this);
                popupisshow = null;
            }
        }
        li.oncontextmenu = function(e) {
            e.preventDefault();
        }
    }
}

function bindLocationFunction(li, src) {
    bindOnClickFunction(li, src);
    li.onmousemove = function(){
        if (popupisshow) {
            hidePopupFunction(this);
            popupisshow = this;
        }
    }
}

function bindPopupFunction(li, tree) {
    bindOnClickFunction(li, tree);
    li.onmousemove = function(){
        if (popupisshow) {
            if (popupisshow == this) {
                return;
            }
            showPopupFunction(this, tree);
            popupisshow = this;

            movePopupFunction(this);
        }
    }
}

function showPopupFunction(li, tree) {
    var popup = document.getElementById('div_popup');
    popup.style.display="block";
    if (popupisshow) {
        popupisshow.style.background='';
    }

    var bookmarkList=document.getElementById('bookmarkList');
    while (bookmarkList.firstChild) {
        bookmarkList.removeChild(bookmarkList.firstChild);
    }

    function findList(inArray) {
        var arrayObj = new Array();

        for (var i = 0; i < inArray.length; i++) {
            var item = inArray[i];

            if (item.dateGroupModified || item.children || typeof item.url == 'undefined') {
                arrayObj = arrayObj.concat(findList(item.children));
            } else {
                arrayObj.push(item);
            }
        }

        return arrayObj;
    }
    var bookmark = findList(tree.children);
    for (var i = 0; i < bookmark.length; i++) {
        var treeItem = bookmark[i];

        var tree_li=createTag('li');
        var tree_img=createTag('img');
        tree_img.setAttribute('src', 'chrome://favicon/size/32/' + treeItem.url);
        var tree_span=createTag('span');
        tree_span.innerText=treeItem.title;
        tree_li.appendChild(tree_img);
        tree_li.appendChild(tree_span);
        tree_li.setAttribute('class', 'site');
        bindOnClickFunction(tree_li, treeItem.url);
        bookmarkList.appendChild(tree_li);
    }

    if (li) {
        li.style.background=hColor;
    }
}

function hidePopupFunction(li) {
    var popup = document.getElementById('div_popup');
    popup.style.display="none";
    if (popupisshow) {
        popupisshow.style.background='';
    }

    if (li) {
        li.style.background='';
    }
}

function movePopupFunction(li) {
    var popup = document.getElementById('div_popup');

    var rect = li.getBoundingClientRect();
    popup.style.top = rect.bottom+2;
    popup.style.left = rect.x;
}

chrome.bookmarks.getTree(
    function(bookmarkArray) {
        var bookmarkTree=document.getElementById('bookmarkTree');

        var apps_li=createTag('li');
        var apps_img=createTag('img');
        apps_img.setAttribute('src', 'icon_apps.png');
        var apps_span=createTag('span');
        apps_span.innerText="应用";
        apps_li.appendChild(apps_img);
        apps_li.appendChild(apps_span);
        apps_li.setAttribute('class', 'site');
        bindLocationFunction(apps_li, 'chrome://apps/');
        bookmarkTree.appendChild(apps_li);

        var bookmarks_li=createTag('li');
        var bookmarks_img=createTag('img');
        bookmarks_img.setAttribute('src', 'icon_bookmarks.png');
        var bookmarks_span=createTag('span');
        bookmarks_span.innerText="书签";
        bookmarks_li.appendChild(bookmarks_img);
        bookmarks_li.appendChild(bookmarks_span);
        bookmarks_li.setAttribute('class', 'site');
        bindLocationFunction(bookmarks_li, 'chrome://bookmarks/');
        bookmarkTree.appendChild(bookmarks_li);

        var bookmark=bookmarkArray[0].children[0].children;
        for (var i = 0; i < bookmark.length; i++) {
            var tree=bookmark[i];
            if (tree.dateGroupModified || tree.children || typeof tree.url == 'undefined') {
                var tree_li=createTag('li');
                var tree_img=createTag('img');
                tree_img.setAttribute('src', 'icon_folder.png');
                var tree_span=createTag('span');
                tree_span.innerText=tree.title;
                tree_li.appendChild(tree_img);
                tree_li.appendChild(tree_span);
                tree_li.setAttribute('class', 'folder');
                bindPopupFunction(tree_li, tree);
                bookmarkTree.appendChild(tree_li);
            } else {
                var tree_li=createTag('li');
                var tree_img=createTag('img');
                tree_img.setAttribute('src', 'chrome://favicon/size/32/' + tree.url);
                var tree_span=createTag('span');
                tree_span.innerText=tree.title;
                tree_li.appendChild(tree_img);
                tree_li.appendChild(tree_span);
                tree_li.setAttribute('class', 'site');
                bindLocationFunction(tree_li, tree.url);
                bookmarkTree.appendChild(tree_li);
            }
        }
    }
);

chrome.bookmarks.onCreated.addListener(function(bookmark){location.reload();});
chrome.bookmarks.onRemoved.addListener(function(id, removeInfo){location.reload();});
chrome.bookmarks.onChanged.addListener(function(id, changeInfo){location.reload();});
chrome.bookmarks.onMoved.addListener(function(id, moveInfo){location.reload();});
