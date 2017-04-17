var LifeVizApi = function() {
    return {
        // for now, use setTimeout for test
        getHobbyByYear: function(callback) {
            $.get("http://heyi.ml/life.me/json/get_hobbies.json")
                .done(function(data) {
                    if (callback) {
                        callback(data);
                    }
                })
                .fail(function(err) {
                    console.log("error occurred getting places by year");
                });
        },

      

        getPhotos: function(place, callback) {
            $.get("http://131.94.133.236:8080/life_viz/api/get_photos_by_place/" + place)
                .done(function(data) {
                    if (callback) {
                        callback(data);
                    }
                })
                .fail(function(err) {
                    console.log("error occurred getting photos");
                });
        }
    };
}();

