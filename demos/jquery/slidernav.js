(function($, window){

    var module = {

        $navContainer: null,
        id: 0,
        toc: {},
        individualItemCallback: function() {},

        bindLayer: function($layer, tocPath) {
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

                var itemElement = $('<div>');
                itemElement.attr('data-parent', isParent.toString());
                itemElement.attr('data-toc-path', newPath.join(','));
                itemElement.attr('data-name', item.fileName);
                itemElement.attr('title', item.title);
                itemElement.addClass('slidernav-item');
                itemElement.text(item.title);

                $layer.append(itemElement);
            });

            return $layer;
        },

        addLayer: function(tocPath, parentTitle) {
            module.id++;

            var layerId = 'layer-' + module.id;

            var $layer = $('<div>');
            $layer.attr('id', layerId);
            $layer.attr('data-toc-path', tocPath);
            $layer.css('z-index', (module.id + 100));
            $layer.addClass('slidernav-layer');

            var $closeButton = $('<div>');
            $closeButton.addClass('pointer');
            $closeButton.attr('data-role', 'close-layer');
            $closeButton.attr('title', parentTitle);
            $closeButton.html('<span class="left-arrow"></span>' + parentTitle);

            $layer.append($closeButton);

            $layer = module.bindLayer($layer, tocPath);

            module.$navContainer.append($layer);

            setTimeout(function() {
                $('#' + layerId).addClass('slidernav-show');
            }, 0);
        },

        hideLayer: function(e) {
            var parentSelector = '#' + $(e.currentTarget).parent().attr('id');
            var $parent = $(parentSelector);
            $parent.removeClass('slidernav-show');

            var parentTocPath = $parent.data('toc-path');
            module.removeLastLayer(parentTocPath);
        },

        removeLastLayer: function(parentTocPath) {
            setTimeout(function() {
                module.$navContainer.find('.slidernav-layer[data-toc-path^="' + parentTocPath + '"]').remove();
            }, 1000); // allow enough time for close animation to complete
        },

        parentClick: function(e){
            var $target = $(e.currentTarget);
            $target.parent().find('.slidernav-item-selected').removeClass('slidernav-item-selected');
            $target.addClass('slidernav-item-selected');
            var title = $target.text(); 
            module.addLayer($target.data('toc-path'), title);
        },

        itemClick: function(e){
            var $target = $(e.currentTarget);
            $target.parent().find('.slidernav-item-selected').removeClass('slidernav-item-selected');
            $target.addClass('slidernav-item-selected');

            var args = {
                tocPath: $target.data('toc-path'),
                fileName: $target.data('name'),
                title: $target.text()
            };

            module.individualItemCallback(e, args);
        },

        init: function(toc, callback) {
            module.$navContainer = $('div[data-role="slidernav-container"]');
            module.toc = toc;
            module.individualItemCallback = callback;

            module.bindLayer(module.$navContainer.find('div[data-role="slidernav-root"]'));

            module.$navContainer.on('click', '[data-role="close-layer"]', module.hideLayer);
            module.$navContainer.on('click', 'div[data-parent="false"]', module.itemClick);
            module.$navContainer.on('click', 'div[data-parent="true"]', module.parentClick);
        }
    };

    window.sliderNav = {
        init: module.init
    };

}(jQuery, window));