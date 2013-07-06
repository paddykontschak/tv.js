define([
    "Underscore",
    "jQuery",
    "yapp/yapp",
    "utils/navigation",
    "collections/movies"
], function(_, $, yapp, Navigation, Movies) {
    var logging = yapp.Logger.addNamespace("movies");

    // List Item View
    var MovieItem = yapp.List.Item.extend({
        className: "movie",
        template: "movie.html",
        events: {
            "click .cover": "open",
            "click .action": "run"
        },
        templateContext: function() {
            return {
                object: this.model,
            }
        },
        finish: function() {
            return MovieItem.__super__.finish.apply(this, arguments);
        },

        /* (action) Open infos */
        open: function() {
            this.list.closeAll();
            this.$el.addClass("active");
            $('html, body').animate({
                "scrollTop": this.$el.offset().top-180
            }, 600);
        },

        /* (action) Open infos */
        close: function() {
            this.$el.removeClass("active");
        },

        /* Default action */
        run: function(e) {
            if (e != null) e.preventDefault();

            if (this.model.canPlay()) {
                this.model.play();
            } else if (!this.model.isDownloading()) {
                this.model.download();
            }
        },

        /* Is active */
        isActive: function(e) {
            return this.$el.hasClass("active");
        },
    });

    // List View
    var MoviesList = yapp.List.extend({
        className: "movies",
        Collection: Movies,
        Item: MovieItem,
        defaults: _.defaults({
            loadAtInit: false
        }, yapp.List.prototype.defaults),

        initialize: function() {
            MoviesList.__super__.initialize.apply(this, arguments);
            Navigation.bind('right', _.bind(this.selectionRight, this));
            Navigation.bind('left', _.bind(this.selectionLeft, this));
            Navigation.bind('up', _.bind(this.selectionUp, this));
            Navigation.bind('down', _.bind(this.selectionDown, this));
            Navigation.bind('enter', _.bind(this.actionSelection, this));
            return this;
        },

        search: function(q) {
            this.collection.options.loaderArgs = [q];
            return this.refresh();
        },

        /* Closeall the movie */
        closeAll: function() {
            _.each(this.items, function(item) {
                item.close();
            });
            return this;
        },

         /* Get index active item */
        activeItem: function() {
            return _.reduce(this.items, function(state, item, i) {
                if (item.isActive()) {
                    return item;
                }
                return state;
            }, null);
        },

        /* Get index active item */
        activeIndex: function() {
            return _.reduce(this.getItemsList(), function(state, item, i) {
                if (item.isActive()) {
                    return i;
                }
                return state;
            }, null);
        },

        /* Return items by lines */
        itemsByLine: function() {
            return Math.floor(this.$el.width()/274);
        },

        /* Focus on search bar */
        focusSearch: function() {
            this.closeAll();
            this.parent.focusSearch();
            return this;
        },

        /* Focus on list */
        focus: function() {
            this.closeAll();
            this.selectionRight();
            this.parent.blurSearch();
            return this;
        },

        /* Select next */
        selectionMove: function(d) {
            var items = this.getItemsList();
            var i = this.activeIndex();
            if (i == null) {
                i = 0;
            } else {
                i = i + d;
            }
            if (_.size(this.items) == 0) return this;

            if (i >= _.size(this.items)) _.size(this.items) - 1;
            if (i < 0) return this.focusSearch();
            items[i].open();
            return this;
        },

        /* Select right */
        selectionRight: function() {
            return this.selectionMove(1);
        },

        /* Select left */
        selectionLeft: function() {
            return this.selectionMove(-1);
        },

        /* Select up */
        selectionUp: function() {
            return this.selectionMove(-this.itemsByLine());
        },

        /* Select down */
        selectionDown: function() {
            return this.selectionMove(this.itemsByLine());
        },

        /* Action selection */
        actionSelection: function() {
            var item = this.activeItem();
            if (item == null) return this.selectionRight();
            item.run();
        }
    }, {
        Collection: Movies,
        Item: MovieItem
    });

    yapp.View.Template.registerComponent("list.movies", MoviesList);

    return MoviesList;
});