(function ($, window) {

    'use strict';

    var module = {

        $navContainer: null,
        id: 0,
        navData: {},
        individualItemCallback: function() {},

        init: function(navData, callback) {
            module.$navContainer = $('div[data-role="slidernav-container"]');
            module.navData = navData;
            module.individualItemCallback = callback;

            module.bindLayer(module.$navContainer.find('div[data-role="slidernav-root"]'));

            module.$navContainer.on('click', 'div[data-role="close-layer"]', module.hideLayer);
            module.$navContainer.on('click', 'div[data-parent="false"]', module.itemClick);
            module.$navContainer.on('click', 'div[data-parent="true"]', module.parentClick);
        },

        bindLayer: function($layer, navPath) {
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

                isParent = (item.children && item.children.length > 0);

                itemElement = $('<div>');
                itemElement.attr('data-parent', isParent.toString());
                itemElement.attr('data-nav-path', newPath.join(','));
                itemElement.attr('data-name', item.fileName);
                itemElement.attr('title', item.title);
                itemElement.addClass('slidernav-item');
                itemElement.text(item.title);

                $layer.append(itemElement);
            });

            return $layer;
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
            var $target, title;

            $target = $(e.currentTarget);
            $target.parent().find('.slidernav-item-selected').removeClass('slidernav-item-selected');
            $target.addClass('slidernav-item-selected');
            
            title = $target.text(); 
            module.addLayer($target.data('nav-path'), title);
        },

        addLayer: function(navPath, parentTitle) {
            var layerId, $layer, $closeButton;

            module.id++;

            layerId = 'layer-' + module.id;

            $layer = $('<div>');
            $layer.attr('id', layerId);
            $layer.attr('data-nav-path', navPath);
            $layer.css('z-index', (module.id + 100));
            $layer.addClass('slidernav-layer');

            $closeButton = $('<div>');
            $closeButton.addClass('pointer');
            $closeButton.attr('data-role', 'close-layer');
            $closeButton.attr('title', parentTitle);
            $closeButton.html('<span class="left-arrow"></span>' + parentTitle);

            $layer.append($closeButton);

            $layer = module.bindLayer($layer, navPath);

            module.$navContainer.append($layer);

            setTimeout(function() {
                $('#' + layerId).addClass('slidernav-show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector, $parent, parentnavPath;

            parentSelector = '#' + $(e.currentTarget).parent().attr('id');
            $parent = $(parentSelector);
            $parent.removeClass('slidernav-show');

            parentnavPath = $parent.data('nav-path');
            module.removeLastLayer(parentnavPath);
        },

        removeLastLayer: function(parentnavPath) {
            setTimeout(function() {
                module.$navContainer.find('.slidernav-layer[data-nav-path^="' + parentnavPath + '"]').remove();
            }, 1000); // allow enough time for close animation to complete
        },

        itemClick: function(e){
            var $target, args;

            $target = $(e.currentTarget);
            $target.parent().find('.slidernav-item-selected').removeClass('slidernav-item-selected');
            $target.addClass('slidernav-item-selected');

            args = {
                navPath: $target.data('nav-path'),
                fileName: $target.data('name'),
                title: $target.text()
            };

            module.individualItemCallback(e, args);
        }

    };

    window.sliderNav = {
        init: module.init
    };

}(jQuery, window));