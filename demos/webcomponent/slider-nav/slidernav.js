(function(window, document){

    'use strict';

    var module = {

        component: null,
        navContainer: null,
        id: 0,
        navData: {},

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

        bindLayer: function(layer, navPath) {
            var items, path;

            if(!module.navData) {
                return;
            }

            if(!navPath) {
                items = module.navData;
                path = [];
            } else {
                path = navPath.toString().split(',');
                items = module.getItems(path, module.navData);
            }

            items.forEach(function(item, index) {
                var newPath, isParent, itemElement;

                newPath = path.concat([String(index)]);
                isParent = false;

                if(item.children) {
                    isParent = item.children.length > 0;
                }

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
            var parentSelector, parent, parentnavPath;

            parentSelector = '#' + e.target.parentElement.getAttribute('id');
            parent = module.component.querySelector(parentSelector);
            parent.classList.remove('show');

            parentnavPath = parent.getAttribute('data-nav-path');
            module.removeLastLayer(parentnavPath);
        },

        removeLastLayer: function(parentnavPath) {
            setTimeout(function() {
                module.navContainer.querySelector('.layer[data-nav-path^="' + parentnavPath + '"]').remove();    
            }, 1000); // allow enough time for close animation to complete
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
        },

        init: function(navData, component) {

            module.component = component;

            module.navContainer = module.component.querySelector('div[data-role="container"]');
            module.navData = navData;

            module.bindLayer(module.navContainer.querySelector('div[data-role="root"]'));

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
        }
    };

    module.bootstrap();

}(window, document));