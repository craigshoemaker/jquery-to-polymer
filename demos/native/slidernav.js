(function(window, document){

    'use strict';

    var module = {

        navContainer: null,
        id: 0,
        navData: {},
        individualItemCallback: function() {},

        init: function(navData, callback) {
            
            module.navContainer = document.querySelector('div[data-role="slidernav-container"]');
            module.navData = navData;
            module.individualItemCallback = callback;

            module.bindLayer(module.navContainer.querySelector('div[data-role="slidernav-root"]'));

            module.navContainer.addEventListener('click', function(e){

                var currentTarget = e.target;

                if(currentTarget.getAttribute('data-role') === 'close-layer') {
                    module.hideLayer(e);
                } else if(currentTarget.getAttribute('data-parent') === 'false') {
                    module.itemClick(e);
                } else if(currentTarget.getAttribute('data-parent') === 'true') {
                    module.parentClick(e);
                }

            });
        },

        bindLayer: function(layer, navPath) {
            var items, path, newPath, isParent, itemElement;

            if(typeof navPath === 'undefined') {
                items = module.navData;
                path = [];
            } else {
                path = navPath.toString().split(',');
                items = module.getItems(path, module.navData);
            }

            items.forEach(function(item, index) {
                newPath = path.concat([index]);
                isParent = false;

                isParent = item.children && item.children.length > 0;

                itemElement = document.createElement('DIV');
                itemElement.setAttribute('data-parent', isParent.toString());
                itemElement.setAttribute('data-nav-path', newPath.join(','));
                itemElement.setAttribute('data-name', item.fileName);
                itemElement.setAttribute('title', item.title);
                itemElement.setAttribute('class', 'slidernav-item');
                itemElement.innerText = item.title;

                layer.append(itemElement);
            });

            return layer;
        },

        getItems: function(path, parent) {
            var isRoot, level;
            
            // clone path
            path = JSON.parse(JSON.stringify(path));

            path.forEach(function(pathIndex, loopIndex) {
                isRoot = (loopIndex === 0);

                if(isRoot){
                    level = parent[pathIndex];
                } else {
                    level = level.children[pathIndex];
                }
            });

            return level.children;
        },

        parentClick: function(e){
            var target, selectedItems, title;

            target = e.target;

            selectedItems = target.parentElement.querySelector('.slidernav-item-selected');
            if(selectedItems) {
                selectedItems.classList.remove('slidernav-item-selected');
            }

            target.classList.add('slidernav-item-selected');

            title = target.innerText; 
            module.addLayer(target.getAttribute('data-nav-path'), title);
        },

        addLayer: function(navPath, parentTitle) {
            var layerId, layer, closeButton;

            module.id++;

            layerId = 'layer-' + module.id;

            layer = document.createElement('DIV');
            layer.setAttribute('id', layerId);
            layer.setAttribute('data-nav-path', navPath);
            layer.style.zIndex = (module.id + 100);
            layer.classList.add('slidernav-layer');

            closeButton = document.createElement('DIV');
            closeButton.classList.add('pointer');
            closeButton.setAttribute('data-role', 'close-layer');
            closeButton.setAttribute('title', parentTitle);
            closeButton.innerHTML = '<span class="left-arrow"></span>' + parentTitle;

            layer.append(closeButton);

            layer = module.bindLayer(layer, navPath);

            module.navContainer.append(layer);

            setTimeout(function() {
                document.querySelector('#' + layerId).classList.add('slidernav-show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector, parent, parentNavPath;

            parentSelector = '#' + e.target.parentElement.getAttribute('id');
            parent = document.querySelector(parentSelector);
            parent.classList.remove('slidernav-show');

            parentNavPath = parent.getAttribute('data-nav-path');
            module.removeLastLayer(parentNavPath);
        },

        removeLastLayer: function(parentNavPath) {
            setTimeout(function() {
                module.navContainer.querySelector('.slidernav-layer[data-nav-path^="' + parentNavPath + '"]').remove();    
            }, 1000); // allow enough time for close animation to complete
        },

        itemClick: function(e){
            var target, selected, args;

            target = e.target;

            selected = target.parentElement.querySelectorAll('.slidernav-item-selected');
            
            if(selected && selected.length > 0) {
                [].forEach.call(selected, function(item) {
                    item.classList.remove('slidernav-item-selected');
                });
            }

            target.classList.add('slidernav-item-selected');

            args = {
                navPath: target.getAttribute('data-nav-path'),
                fileName: target.getAttribute('data-name'),
                title: target.innerText
            };

            module.individualItemCallback(e, args);
        }
        
    };

    window.sliderNav = {
        init: module.init
    };

}(window, document));