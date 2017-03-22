(function(window, document){

    'use strict';

    var module = {

        component: null,
        navContainer: null,
        id: 0,
        toc: {},

        getItems: function(path, parent) {
            
            // clone path
            path = JSON.parse(JSON.stringify(path));

            var isRoot, level;
            path.forEach(function(pathIndex, loopIndex) {
                isRoot = loopIndex === 0;

                if(isRoot){
                    level = parent[pathIndex];
                } else {
                    level = level.children[pathIndex];
                }
            });

            return level.children;
        },

        bindLayer: function(layer, tocPath) {
            var items, path;

            if(!module.toc) {
                return;
            }

            if(!tocPath) {
                items = module.toc;
                path = [];
            } else {
                path = tocPath.toString().split(',');
                items = module.getItems(path, module.toc);
            }

            items.forEach(function(item, index) {
                var newPath = path.concat([String(index)]);
                var isParent = false;

                if(item.children) {
                    isParent = item.children.length > 0;
                }

                var itemElement = document.createElement('DIV');
                itemElement.setAttribute('data-parent', isParent.toString());
                itemElement.setAttribute('data-toc-path', newPath.join(','));
                itemElement.setAttribute('data-name', item.fileName);
                itemElement.setAttribute('title', item.title);
                itemElement.setAttribute('class', 'item');
                itemElement.innerText = item.title;

                layer.append(itemElement);
            });

            return layer;
        },

        addLayer: function(tocPath, parentTitle) {
            module.id++;

            var layerId = 'layer-' + module.id;

            var layer = document.createElement('DIV');
            layer.setAttribute('id', layerId);
            layer.setAttribute('data-toc-path', tocPath);
            layer.style.zIndex = (module.id + 100);
            layer.classList.add('layer');

            var closeButton = document.createElement('DIV');
            closeButton.classList.add('pointer');
            closeButton.setAttribute('data-role', 'close-layer');
            closeButton.setAttribute('title', parentTitle);
            closeButton.innerHTML = '<span class="left-arrow"></span>' + parentTitle;

            layer.append(closeButton);

            layer = module.bindLayer(layer, tocPath);

            module.navContainer.append(layer);

            setTimeout(function() {
                module.component.querySelector('#' + layerId).classList.add('show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector = '#' + e.target.parentElement.getAttribute('id');
            var parent = module.component.querySelector(parentSelector);
            parent.classList.remove('show');

            var parentTocPath = parent.getAttribute('data-toc-path');
            module.removeLastLayer(parentTocPath);
        },

        removeLastLayer: function(parentTocPath) {
            setTimeout(function() {
                module.navContainer.querySelector('.layer[data-toc-path^="' + parentTocPath + '"]').remove();    
            }, 1000); // allow enough time for close animation to complete
        },

        parentClick: function(e){
            var target = e.target;

            var selectedItems = target.parentElement.querySelector('.item-selected');
            if(selectedItems) {
                selectedItems.classList.remove('item-selected');
            }

            target.classList.add('item-selected');

            var title = target.innerText; 
            module.addLayer(target.getAttribute('data-toc-path'), title);
        },

        itemClick: function(e){
            var target = e.target;

            var selected = target.parentElement.querySelectorAll('.item-selected');
            
            if(selected && selected.length > 0) {
                [].forEach.call(selected, function(item) {
                    item.classList.remove('item-selected');
                });
            }

            target.classList.add('item-selected');

            var args = {
                tocPath: target.getAttribute('data-toc-path'),
                fileName: target.getAttribute('data-name'),
                title: target.innerText
            };

            var event = new CustomEvent('itemselected', { 
                detail: {
                    ui: e, 
                    data: args
                }
             });

            module.navContainer.dispatchEvent(event);
        },

        init: function(toc, component) {

            module.component = component;

            module.navContainer = module.component.querySelector('div[data-role="container"]');
            module.toc = toc;

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
            var component, template, root;

            var proto = Object.create(HTMLElement.prototype);
            var script = document.currentScript.ownerDocument;

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