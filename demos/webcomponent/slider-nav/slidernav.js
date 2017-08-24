(function(window, document){

    'use strict';

    var module = {

        component: null,
        navContainer: null,
        id: 0,
        navData: {},

        bootstrap: function() {
            var component, template, root, proto, script;

            proto = Object.create(HTMLElement.prototype);
            script = document.currentScript.ownerDocument;

            proto.createdCallback = function() {
                template = script.querySelector('template');
                component = document.importNode(template.content, true);
                root = this.createShadowRoot();
                
                component.getElementById('title').innerText = this.getAttribute('title');

                root.appendChild(component);

                this.addEventListener('data', function(e) {
                    module.init(e.detail, root);
                });
            };

            document.registerElement('slider-nav', { prototype: proto });
        },

        init: function(navData, component) {

            module.component = component;

            module.navContainer = module.component.querySelector('div[data-role="container"]');
            module.navData = navData;

            module.bindLayer(module.navContainer.querySelector('div[data-role="root"]'));

            module.navContainer.addEventListener('click', function(e){

                var currentTarget, isItem, isParent, isCloseLayer;

                currentTarget = e.target;
                isItem = currentTarget.classList.contains('item');
                isCloseLayer = currentTarget.getAttribute('data-role') === 'close-layer';

                if(isItem || isCloseLayer){
                    isParent = /true/i.test(currentTarget.getAttribute('data-parent'));

                    if(isCloseLayer) {
                        module.hideLayer(e);
                    } else if(isParent) {
                        module.parentClick(e);
                    } else {
                        module.itemClick(e);
                    }
                }
            });
        },

        bindLayer: function(layer, navPath) {
            var items, path, newPath, isParent, itemElement;
            

            if(!module.navData) {
                return;
            }

            if(typeof navPath === 'undefined') {
                items = module.navData;
                path = [];
            } else {
                path = navPath.toString().split(',');
                items = module.getItems(path, module.navData);
            }

            items.forEach(function(item, index) {
                newPath = path.concat([index.toString()]);
                isParent = false;

                isParent = item.children && item.children.length > 0;

                itemElement = document.createElement('DIV');
                itemElement.setAttribute('data-parent', isParent.toString());
                itemElement.setAttribute('data-nav-path', newPath.join(','));
                itemElement.setAttribute('data-name', item.fileName);
                itemElement.setAttribute('title', item.title);
                itemElement.setAttribute('class', 'item');
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

            selectedItems = target.parentElement.querySelector('.item-selected');
            if(selectedItems) {
                selectedItems.classList.remove('item-selected');
            }

            target.classList.add('item-selected');

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
            layer.classList.add('layer');

            closeButton = document.createElement('DIV');
            closeButton.classList.add('pointer');
            closeButton.setAttribute('data-role', 'close-layer');
            closeButton.setAttribute('title', parentTitle);
            closeButton.innerHTML = '<span class="left-arrow"></span>' + parentTitle;

            layer.append(closeButton);

            layer = module.bindLayer(layer, navPath);

            module.navContainer.append(layer);

            setTimeout(function() {
                module.component.querySelector('#' + layerId).classList.add('show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector, parent, parentNavPath;

            parentSelector = '#' + e.target.parentElement.getAttribute('id');
            parent = module.component.querySelector(parentSelector);
            parent.classList.remove('show');

            parentNavPath = parent.getAttribute('data-nav-path');
            module.removeLastLayer(parentNavPath);
        },

        removeLastLayer: function(parentNavPath) {
            setTimeout(function() {
                module.navContainer.querySelector('.layer[data-nav-path^="' + parentNavPath + '"]').remove();    
            }, 1000); // allow enough time for close animation to complete
        },

        itemClick: function(e){
            var target, selected, args, event;

            target = e.target;

            selected = target.parentElement.querySelectorAll('.item-selected');
            
            if(selected && selected.length > 0) {
                [].forEach.call(selected, function(item) {
                    item.classList.remove('item-selected');
                });
            }

            target.classList.add('item-selected');

            args = {
                navPath: target.getAttribute('data-nav-path'),
                fileName: target.getAttribute('data-name'),
                title: target.innerText
            };

            event = new CustomEvent('itemselected', { 
                detail: {
                    ui: e, 
                    data: args
                }
             });

            module.navContainer.dispatchEvent(event);
        }
    };

    module.bootstrap();

}(window, document));