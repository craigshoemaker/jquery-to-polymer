(function(window, document){

    var module = {

        navContainer: null,
        id: 0,
        toc: {},
        individualItemCallback: function() {},

        bindLayer: function(layer, tocPath) {
            var items, path;

            if(!tocPath) {
                items = module.toc;
                path = [];
            } else {
                path = tocPath.toString().split(',');
                items = eval(('module.toc[' + path.join('].children[') + '].children').replace('[].children', ''));
            }

            items.forEach(function(item, index) {
                var newPath = path.concat([index]);
                var isParent = false;

                if(item.children) {
                    isParent = item.children.length > 0;
                }

                var itemElement = document.createElement('DIV');
                itemElement.setAttribute('data-parent', isParent.toString());
                itemElement.setAttribute('data-toc-path', newPath.join(','));
                itemElement.setAttribute('data-name', item.fileName);
                itemElement.setAttribute('title', item.title);
                itemElement.setAttribute('class', 'slidernav-item');
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
            layer.classList.add('slidernav-layer');

            var closeButton = document.createElement('DIV');
            closeButton.classList.add('pointer');
            closeButton.setAttribute('data-role', 'close-layer');
            closeButton.setAttribute('title', parentTitle);
            closeButton.innerHTML = '<span class="left-arrow"></span>' + parentTitle;

            layer.append(closeButton);

            layer = module.bindLayer(layer, tocPath);

            module.navContainer.append(layer);

            setTimeout(function() {
                document.querySelector('#' + layerId).classList.add('slidernav-show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector = '#' + e.target.parentElement.getAttribute('id');
            var parent = document.querySelector(parentSelector);
            parent.classList.remove('slidernav-show');

            var parentTocPath = parent.getAttribute('data-toc-path');
            module.removeLastLayer(parentTocPath);
        },

        removeLastLayer: function(parentTocPath) {
            setTimeout(function() {
                module.navContainer.querySelector('.slidernav-layer[data-toc-path^="' + parentTocPath + '"]').remove();    
            }, 1000); // allow enough time for close animation to complete
        },

        parentClick: function(e){
            var target = e.target;

            var selectedItems = target.parentElement.querySelector('.slidernav-item-selected');
            if(selectedItems) {
                selectedItems.classList.remove('slidernav-item-selected');
            }

            target.classList.add('slidernav-item-selected');

            var title = target.innerText; 
            module.addLayer(target.getAttribute('data-toc-path'), title);
        },

        itemClick: function(e){
            var target = e.target;

            var selected = target.parentElement.querySelectorAll('.slidernav-item-selected');
            
            if(selected && selected.length > 0) {
                [].forEach.call(selected, function(item) {
                    item.classList.remove('slidernav-item-selected');
                });
            }

            target.classList.add('slidernav-item-selected');

            var args = {
                tocPath: target.getAttribute('data-toc-path'),
                fileName: target.getAttribute('data-name'),
                title: target.innerText
            };

            module.individualItemCallback(e, args);
        },

        init: function(toc, callback) {
            
            module.navContainer = document.querySelector('div[data-role="slidernav-container"]');
            module.toc = toc;
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
        }
    };

    window.sliderNav = {
        init: module.init
    };

}(window, document));