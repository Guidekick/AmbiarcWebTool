var iconDefault;
// saved main build reference
var mainBldgID;
// reference to custom rightclick menu reference
var poiMenuSelector;
// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;
// tracked references to POI's
var poisInScene = [];
// global lobal state indicating the current sleected floor
var currentFloorId, currentLabelId, ambiarc, fr, parsedJson;

// Creating the right-click menu
$(document).ready(function() {

    var $body = $(document.body);

    var menu = new BootstrapMenu('#bootstrap', {
        actions: [{
            name: 'Label',
            onClick: function() {
                createTextLabel();
                menu.close();
            }
        }, {
            name: 'Icon',
            onClick: function() {
                createIconLabel();
                menu.close();
            }
        }, {
            name: 'Cancel',
            onClick: function() {
                menu.close();
            }
        }],
        menuEvent: 'right-click'
    });
    poiMenuSelector = menu.$menu[0];


    $('#bldg-floor-select').on('change', function(){

        var parsedValue = $(this).val().split('::');
        var buildingId = parsedValue[0];
        var floorId = parsedValue[1];

        ambiarc.focusOnFloor(buildingId, floorId)
    });



    //PANEL ELEMENTS HANDLERS

    $('#import-file').on('change', importFileHandler);

    $('.poi-list-panel').find('.header-button').on('click', function(){
        $('.header-button').removeClass('selected').removeClass('btn-primary').removeClass('btn-selected');
        $(this).addClass('btn-primary').addClass('btn-selected');
    });

    $('.poi-details-panel').find('.back-to-list').on('click', showPoiList);

    $('#undo-actions').on('click', function(){

        if(ambiarc.history.length > 1) {
            var historyLastOp = ambiarc.history.length - 1;
            // ambiarc.poiList[currentLabelId] = ambiarc.history[historyLastOp - 1];
            ambiarc.poiList[currentLabelId] = jQuery.extend({}, ambiarc.history[historyLastOp - 1]);
            ambiarc.history = ambiarc.history.slice(0, -1);
        }

        fillDetails(ambiarc.poiList[currentLabelId]);

        //updating map label
        ambiarc.updateMapLabel(currentLabelId, ambiarc.poiList[currentLabelId].type, ambiarc.poiList[currentLabelId]);
    });


    $('#poi-select-button').on('click', showIconsPanel);


    $('#import-btn').on('click', importData);
    $('#export-btn').on('click', exportData);
    $('#new-scene-btn').on('click', newScene);

    $('#poi-browse-icons').on('click', function(){
        $('#icon-file-hidden').trigger('click');
    });

    $('.icon-sample').on('click', iconImageHandler);

    $('#icon-file-hidden').on('change', importIconHandler);



    //UPDATE POI DATA HANDLERS

    $('#poi-title').on('change', function(){
        updatePoiDetails('label', $(this).val())
    });

    $('#poi-type').on('change', function(){
        updatePoiDetails('type', $(this).val())
    });

    $('#poi-font-size').on('change', function(){
        updatePoiDetails('fontSize', $(this).val())
    });

    $('#poi-bulding-id').on('change', function(){
        updatePoiDetails('buildingId', $(this).val())
    });

    $('#poi-floor-id').on('change', function(){
        updatePoiDetails('floorId', $(this).val())
    });

    $('#poi-label-latitude').on('change', function(){
        updatePoiDetails('latitude', $(this).val())
    });

    $('#poi-label-longitude').on('change', function(){
        updatePoiDetails('longitude', $(this).val())
    });

    $('#poi-tooltip-title').on('change', function(){
        updatePoiDetails('tooltipTitle', $(this).val())
    });

    $('#poi-tooltip-body').on('change', function(){
        updatePoiDetails('tooltipBody', $(this).val())
    });

    $('#poi-tooltips-toggle').on('change', function(){
        updatePoiDetails('showToolTip', $(this).is(':checked'));
    });

    $('body').on('change', '.poi-floor-id', function(){
        updatePoiDetails('floorId', $(this).val());
    })

    $('body').on('change', '#poi-bulding-id', function(){
        updatePoiDetails('floorId', $(this).val());
    })

    $('#poi-delete').on('click', function(){

        ambiarc.destroyMapLabel(currentLabelId);
        deletePoiData(currentLabelId);
        updatePoiList();
        showPoiList();
    });

    $('#cancel-icon-select').on('click', showPoiDetails);

    $('#save-icon-select').on('click', saveNewIcon);

    iconDefault = $('.selected-icon').attr('src');
    console.log("defautl icon set!!");
    console.log(iconDefault);

});


var showPoiList = function(){
    emptyDetailsData();
    $('.poi-details-panel').addClass('invisible');
    $('.icons-list-panel').addClass('invisible');
    $('.poi-list-panel').removeClass('invisible');

    currentLabelId = undefined;
}


// Creates a Text MapLabel on the map where the current mouse position is
var createTextLabel = function() {
    // var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    // getMapPositionAtCursor is a convenience method that return a map world position where the mouse is on screen XY

    // ambiarc.getMapPositionAtCursor((vector3) => {
    ambiarc.getMapPositionAtCursor(ambiarc.coordType.gps, (latlon) => {

        var mapLabelInfo = {
            buildingId: mainBldgID,
            floorId: currentFloorId,
            latitude: latlon.lat,
            longitude:latlon.lon,
            label: 'Ambiarc Text Label: ' + poisInScene.length,
            fontSize: 24,
            category: 'Label',
            showOnCreation: true,
            type: 'Text',
            showToolTip: false,
            tooltipTitle: '',
            tooltipBody: ''
        };

    // Add the map label to the map
    ambiarc.createMapLabel(ambiarc.mapLabel.Text, mapLabelInfo, (labelId) => {
        // Callback triggered once the label is added
        mapLabelCreatedCallback(labelId, mapLabelInfo.label, mapLabelInfo);
});
});
}

// Creates an Icon MapLabel on the map where the current mouse position is
var createIconLabel = function() {
    // var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;

    // ambiarc.getMapPositionAtCursor((vector3) => {
    ambiarc.getMapPositionAtCursor(ambiarc.coordType.gps, (latlon) => {

        var mapLabelInfo = {
            buildingId: mainBldgID,
            floorId: currentFloorId,
            latitude: latlon.lat,
            longitude:latlon.lon,
            category: 'Label',
            location: 'Default',
            partialPath: 'Information',
            showOnCreation: true,
            type: 'Icon',
            showToolTip: false,
            tooltipTitle: '',
            tooltipBody: '',
            base64: iconDefault
        };
    ambiarc.createMapLabel(ambiarc.mapLabel.Icon, mapLabelInfo, (labelId) => {
        var mapLabelName = 'Ambiarc Icon Label: ' + poisInScene.length;
    mapLabelCreatedCallback(labelId, mapLabelName, mapLabelInfo);
});
});
}
// Callback thats updates the UI after a POI is created
var mapLabelCreatedCallback = function(labelId, labelName, mapLabelInfo) {
    // push reference of POI to list
    poisInScene.push(labelId);
    ambiarc.poiList[labelId] = mapLabelInfo;
    addElementToPoiList(labelId, labelName, mapLabelInfo);
}

// HTML floor selector clicked action, this method will place the map into floor selector mode when the HTML is active
var dropdownClicked = function() {

    if (!isFloorSelectorEnabled) {
        $("#levels-dropdown").addClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', true);
        isFloorSelectorEnabled = true;
    } else {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
        $("#currentFloor").text("Exterior");
    }
    // var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    //calling viewFloorSelector when in floor selector mode will exit floor selector mode
    ambiarc.viewFloorSelector(mainBldgID);
};

// subscribe to the AmbiarcSDK loaded event
var iframeLoaded = function() {
    $("#ambiarcIframe")[0].contentWindow.document.addEventListener('AmbiarcAppInitialized', function() {
        onAmbiarcLoaded();
    });
}
// once Ambiarc is loaded, we can use the ambiarc object to call SDK functions
var onAmbiarcLoaded = function() {
    ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    // Subscribe to various events needed for this application
    ambiarc.registerForEvent(ambiarc.eventLabel.RightMouseDown, onRightMouseDown);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, onFloorSelected);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorEnabled, onEnteredFloorSelector);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorDisabled, onExitedFloorSelector);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorFloorFocusChanged, onFloorSelectorFocusChanged);
    ambiarc.registerForEvent(ambiarc.eventLabel.MapLabelSelected, mapLabelClickHandler);
    ambiarc.poiList = {};

    fillBuildingsList();


    // Create our floor selector menu with data fromt the SDK
    ambiarc.getAllBuildings((bldgs) => {
        mainBldgID = bldgs[0];
    ambiarc.getAllFloors(mainBldgID, (floors) => {
        addFloorToFloor(null, mainBldgID, "Exterior");
    for (f in floors) {
        addFloorToFloor(floors[f].id, mainBldgID, floors[f].positionName);
    }
    $('#bootstrap').removeAttr('hidden');
});
});
    $('#controls-section').fadeIn();
}
// creates the right-click menu over the map
var onRightMouseDown = function(event) {

    $(poiMenuSelector).css('top', $(window).height() - event.detail.pixelY + "px");
    $(poiMenuSelector).css('left', event.detail.pixelX + "px");

    if(currentLabelId){


        repositionLabel();
        return;
    }

    if (!isFloorSelectorEnabled) {
        $('#bootstrap').trigger('contextmenu');
    }
    console.log("Ambiarc received a RightMouseDown event");
}

var autoSelectFloor = function(){

    // console.log("AUTO SELECTING FLOOR...");

    if(mainBldgID){
        // console.log("MAIN BUILDING ID DEFINED!");
        ambiarc.getAllFloors(mainBldgID, function(floors){
            currentFloorId = floors[0].id;
            ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, mainBldgID, floors[0].id);
        })
    }
    else {
        console.log("main building id undefiend....");
    }
}

// closes the floor menu when a floor was selected
var onFloorSelected = function(event) {
    var floorInfo = event.detail;
    currentFloorId = floorInfo.floorId;
    if (isFloorSelectorEnabled) {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
    }
    console.log("Ambiarc received a FloorSelected event with a buildingId of " + floorInfo.buildingId + " and a floorId of " + floorInfo.floorId);
}
// expands the floor menu when the map enter Floor Selector mode
var onEnteredFloorSelector = function(event) {
    var buildingId = event.detail;
    currentFloorId = undefined;
    if (!isFloorSelectorEnabled) {
        isFloorSelectorEnabled = true;
        $("#levels-dropdown").addClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', true);
    }
    console.log("Ambiarc received a FloorSelectorEnabled event with a building of " + buildingId);
}
// closes the floor menu when a floor selector mode was exited
var onExitedFloorSelector = function(event) {
    var buildingId = event.detail;
    currentFloorId = undefined;
    if (isFloorSelectorEnabled) {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
    }
    console.log("Ambiarc received a FloorSelectorEnabled event with a building of " + buildingId);
}
// closes the floor menu when a floor selector mode was exited
var onFloorSelectorFocusChanged = function(event) {
    console.log("Ambiarc received a FloorSelectorFocusChanged event with a building id of: " + event.detail.buildingId +
        " and a new floorId of " + event.detail.newFloorId + " coming from a floor with the id of " + event.detail.oldFloorId);
}


var mapLabelClickHandler = function(event) {

    console.log("mab label click handler");

    $('.poi-list-panel').addClass('invisible');
    $('.icons-list-panel').addClass('invisible');
    $('.poi-details-panel').removeClass('invisible');

    if(event.detail == currentLabelId){
        return;
    }
    currentLabelId = event.detail;
    var mapLabelInfo = ambiarc.poiList[event.detail];


    //creating clone of mapLabelInfo object - storing operations for undo
    var initialObj = jQuery.extend({}, mapLabelInfo);
    ambiarc.history = [];
    ambiarc.history.push(initialObj);

    fillDetails(mapLabelInfo);
    // ambiarc.focusOnMapLabel(event.detail, event.detail);

}


// this is called when the user deletes a POI from the list men

    var firstFloorSelected = function(pId) {
        var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
        ambiarc.focusOnFloor(mainBldgID, 'L002');
    };

    var secondFloorSelected = function(pId) {
        var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
        ambiarc.focusOnFloor(mainBldgID, 'L003');
    };


var listPoiClosed = function(mapLabelId) {
    // var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    // destroys the map label removing it from the map
    ambiarc.destroyMapLabel(mapLabelId);
    // remove the POI from our list
    var index = poisInScene.indexOf(mapLabelId);
    poisInScene.splice(index, 1);
    // remove POI from the UI
    $("#" + mapLabelId).fadeOut(300, function() {
        $("#" + mapLabelId).remove();
    });
};
// adds a POI to the HTML list
var addElementToPoiList = function(mapLabelId, mapLabelName, mapLabelInfo) {

    var item = $("#listPoiTemplate").clone().attr('id', mapLabelId).appendTo($("#listPoiContainer"));
    var bldg = 'Building 1';
    var floorNum = 'Floor 1';
    var timestamp = Date.now(),
        date = new Date(timestamp),
        year = date.getFullYear(),
        month = date.getMonth()+1,
        day = date.getDate(),
        hours = date.getHours(),
        minutes = date.getMinutes();

    var fullDate = year+'/'+month+'/'+day;
    var fullTime = hours+'/'+minutes;
    var icon = mapLabelInfo.type == 'Text' ? 'poi-icon poi-text' : 'poi-icon poi-envelope';

    $(item).find('.list-poi-icon').addClass(icon);
    $(item).find('.list-poi-label').html(mapLabelName);
    $(item).find('.list-poi-bldg').html(bldg);
    $(item).find('.list-poi-floor').html(floorNum);
    $(item).find('.list-poi-dtime').html('Added '+fullDate+' at '+fullTime);


    //setting list item click handler
    $(item).on('click', function(){
        currentLabelId = mapLabelId;

        var initState = jQuery.extend({}, ambiarc.poiList[currentLabelId]);
        ambiarc.history = [];
        ambiarc.history.push(initState);

        fillDetails(mapLabelInfo);
        ambiarc.focusOnMapLabel(mapLabelId, mapLabelId);

        $('.poi-list-panel').addClass('invisible');
        $('.icons-list-panel').addClass('invisible');
        $('.poi-details-panel').removeClass('invisible');
    });
};


//refreshing poi list items
var updatePoiList = function(){

    $('#listPoiContainer').html('');

    $.each(ambiarc.poiList, function(id, poiData){
        addElementToPoiList(id, poiData.label, poiData);
    });
}
// adds a floor to the HTML floor selector
var addFloorToFloor = function(fID, bID, name) {
    var item = $("#floorListTemplate").clone().removeClass("invisible").appendTo($("#floorContainer"));
    item.children("a.floorName").text("" + name).on("click", function() {
        // var ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
        // clicking on the floor selector list item will tell Ambiarc to isolate that floor
        if (fID != undefined) {
            ambiarc.focusOnFloor(bID, fID);
            $("#currentFloor").text(name);
        } else {
            ambiarc.viewFloorSelector(bID);
            $("#currentFloor").text(name);
        }
    });
};

var fillDetails = function(mapLabelInfo){

    emptyDetailsData();

    if(mapLabelInfo.type == 'Text' || mapLabelInfo.type == 'TextIcon'){
        $('#poi-title').val(mapLabelInfo.label);
        $('#poi-font-size').val(mapLabelInfo.fontSize);
        $('#poi-title').attr("disabled", false);
        $('#poi-font-size').attr("disabled", false);
    }
    else {
        $('#poi-title').val('');
        $('#poi-font-size').val('');
        $('#poi-title').attr("disabled", true);
        $('#poi-font-size').attr("disabled", true);
    }


    $('#poi-type').val(mapLabelInfo.type);
    $('#poi-bulding-id').val(mapLabelInfo.buildingId);
    $('.poi-floor-id[data-bldgid = "'+mapLabelInfo.buildingId+'"]').val(mapLabelInfo.floorId);
    $('#poi-label-latitude').val(mapLabelInfo.latitude);
    $('#poi-label-longitude').val(mapLabelInfo.longitude);
    $('#poi-tooltips-toggle').prop('checked', mapLabelInfo.showToolTip);
    $('#poi-tooltip-title').val(mapLabelInfo.tooltipTitle);
    $('#poi-tooltip-body').val(mapLabelInfo.tooltipBody);
    $('#poi-icon-image').css('background-image', 'url("'+mapLabelInfo.base64+'")');

}

var labelTypeObj = function(labelString){

    switch (labelString) {
        case 'Text':
            return ambiarc.mapLabel.Text;

        case 'Icon':
            return ambiarc.mapLabel.Icon;

        case 'TextIcon':
            return ambiarc.mapLabel.TextIxon;
    }
}


var collectPoiData = function(){

    var MapLabelType = labelTypeObj($('#poi-type').val()),
        buildingId = $('#poi-bulding-id').val(),
        floorId = $('#poi-floor-id').val(),
        latitude = parseFloat($('#poi-label-latitude').val()),
        longitude = parseFloat($('#poi-label-longitude').val()),
        showOnCreation = $('#poi-creation-show').is(':checked'),
        showToolTip = $('#poi-tooltips-toggle').is(':checked'),
        tooltipTitle = $('#poi-tooltip-title').val(),
        tooltipBody = $('#poi-tooltip-body').val(),
        fontSize = parseInt($('#poi-font-size').val()) || 24, //if no font set, set default value to 24
        label = $('#poi-title').val();

    var MapLabelProperties = {
        buildingId: buildingId,
        floorId: floorId,
        latitude: latitude,
        longitude: longitude,
        showOnCreation: showOnCreation,
        showToolTip: showToolTip,
        tooltipTitle: tooltipTitle,
        tooltipBody: tooltipBody,
        fontSize: fontSize,
        label: label,
        category: 'Label',
        type: MapLabelType,
        location: 'Default',
        partialPath: 'Information'
    }

    return {
        MapLabelProperties: MapLabelProperties,
        MapLabelType: MapLabelType,
    };
}


var fillBuildingsList = function(){

    ambiarc.getAllBuildings(function(buildings){
        $.each(buildings, function(id, bldgValue){

            var bldgListItem = document.createElement('option');
                bldgListItem.clasName = 'bldg-list-item';
                bldgListItem.value = bldgValue;
                bldgListItem.textContent = bldgValue;

            var floorList = document.createElement('select');
                floorList.className = 'poi-floor-id poi-details-input form-control';
                floorList.setAttribute('data-bldgId', bldgValue);

            $('#poi-bulding-id').append(bldgListItem);
            $('#poi-floor-lists').append(floorList);

            ambiarc.getAllFloors(bldgValue, function(floors){
                $.each(floors, function(i, floorValue){

                    //poi details panel floor dropdown
                    var floorItem = document.createElement('option');
                        floorItem.clasName = 'floor-item';
                        floorItem.value = floorValue.id;
                        floorItem.textContent = floorValue.id;

                    $(floorList).append(floorItem);


                    // main building-floor dropdown
                    var listItem = document.createElement('option');
                        listItem.clasName = 'bldg-floor-item';
                        listItem.value = bldgValue+'::'+floorValue.id;
                        listItem.textContent = bldgValue+': '+floorValue.id;

                    $('#bldg-floor-select').append(listItem);

                });

                //To do: add display/hide list conditioning when more than 1 building....

            });
        })
    })
}


var deletePoiData = function(){
    delete ambiarc.poiList[currentLabelId];
    emptyDetailsData();
}


var emptyDetailsData = function(){
    $('#poi-title').val('');
    $('#poi-font-size').val('');
    $('#poi-type').val('Text');
    $('#poi-bulding-id').val('');
    $('#poi-label-latitude').val('');
    $('#poi-label-longitude').val('');
    $('#poi-floor-id').val('');
    $('#poi-tooltip-title').val('');
    $('#poi-tooltip-body').val('');
    $('#poi-new-key').val('');
    $('#poi-new-value').val('');
    $('#poi-creation-show').prop('checked', true);
    $('#poi-tooltips-toggle').prop('checked', false);


}


var updatePoiDetails = function(changedKey, changedValue){

    //collecting poi details
    var MapLabelData = collectPoiData();
    var labelProperties = MapLabelData.MapLabelProperties;
    var bldgId = $('#poi-bulding-id').val();
    var floorId = $("[data-bldgId="+bldgId+"]").val();
    labelProperties.floorId = floorId;

    //storing object clone for undo functionality
    var cloneObj = jQuery.extend({}, labelProperties);
    ambiarc.history.push(cloneObj);

    if($('#poi-type').val() == 'Icon'){
        $('#poi-title').attr("disabled", true);
        $('#poi-font-size').attr("disabled", true);
        $('#select-icon-group').fadeIn();
    }
    if($('#poi-type').val() == 'TextIcon'){
        $('#select-icon-group').fadeIn();
        $('#poi-title').attr("disabled", false);
        $('#poi-font-size').attr("disabled", false);
    }
    if($('#poi-type').val() == 'Text'){
        $('#poi-title').attr("disabled", false);
        $('#poi-font-size').attr("disabled", false);
        $('#select-icon-group').fadeOut();
    }

    //updating map label
    ambiarc.updateMapLabel(currentLabelId, MapLabelData.MapLabelType, labelProperties);

    // If it's pair (longitude and latitude)
    if (typeof changedKey == 'object') {

        for(var i=0; i<changedKey.length; i++){
            ambiarc.poiList[currentLabelId][changedKey[i]] = changedValue[i];
        }
    }
    else {
        //applying changed value to ambiarc.poiList object for current label
        ambiarc.poiList[currentLabelId][changedKey] = changedValue;
    }


    var listItem = $('#'+currentLabelId);
        $(listItem).find('.list-poi-label').html(labelProperties.label);
        $(listItem).find('.list-poi-bldg').html('Building '+labelProperties.buildingId);
        $(listItem).find('.list-poi-floor').html('Floor '+labelProperties.floorId);

    toggleSaveButton();
}


var importData = function(){
    $('#import-file').click();
}


var exportData = function(){

    var exportData = {
        type: "FeatureCollection",
        features: []
    };

    $.each(ambiarc.poiList, function(i, labelInfo){

        var properties = {
            buildingId: labelInfo.buildingId,
            category: labelInfo.category,
            floorId: labelInfo.floorId,
            showOnCreation: labelInfo.showOnCreation,
            showToolTip: labelInfo.showToolTip,
            type: labelInfo.type
        };

        var geometry = {
            type: "Point",
            coordinates: [
                labelInfo.longitude,
                labelInfo.latitude
            ]
        };

        if(properties.category !== 'Icon'){
            properties.fontSize = labelInfo.fontSize;
            properties.label = labelInfo.label;
        }

        var feature = {
            type: "Feature",
            properties: properties,
            geometry: geometry
        };
        exportData.features.push(feature);
    });

    downloadObjectAsJson(exportData, 'geoJSON_'+Date.now());
}


var newScene = function(){

    var r = confirm("Creating new scene will remove all points of interest from map and panel!");
    if (r == true) {
        destroyAllLabels();
    }
};


var toggleSaveButton = function(){

    $('.saved-btn').removeClass('invisible');
    setTimeout(function(){
        $('.saved-btn').addClass('invisible');
    }, 3000);
};


var destroyAllLabels = function(){

     $.each(ambiarc.poiList, function(MapLabelID, a){
         ambiarc.destroyMapLabel(parseInt(MapLabelID));
     });

     ambiarc.poiList = {};
     poisInScene = [];

    updatePoiList();
    showPoiList();
};


var iconImageHandler = function(){
    $('.selected-icon').removeClass('selected-icon');
    $(this).addClass('selected-icon');
};


var getBase64Image = function(img) {
    var canvas = document.createElement("canvas");
    console.log("width:");
    console.log(img.width);
    console.log("height:");
    console.log(img.height);

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.id='test_canvas';
    $('body').append(canvas);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL();
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return dataURL;
};


var importIconHandler = function(){

    $('#poi-browse-text').html();

    if(!input){
        var input = $('#icon-file-hidden')[0];
    }
    var file;

    if (typeof window.FileReader !== 'function') return;

    else if (!input.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = function(image){
            console.log("image loaded!");
            console.log(image);
            var imagePath = $('#icon-file-hidden').val();
            var imageName = imagePath.split('fakepath\\')[1];

            $('#poi-browse-text').html(imageName);
        }
        fr.readAsDataURL(file);
    }
};


var showIconsPanel = function(){
    $('.poi-list-panel').addClass('invisible');
    $('.poi-details-panel').addClass('invisible');
    $('.icons-list-panel').removeClass('invisible');
};


var showPoiDetails = function(){
    $('.poi-details-panel').removeClass('invisible');
    $('.poi-list-panel').addClass('invisible');
    $('.icons-list-panel').addClass('invisible');
};

var saveNewIcon = function(){

    var imgSrc = $('.selected-icon').attr('src');
    var image = document.createElement('img');
        image.src = imgSrc;
    var base64String = getBase64Image(image);

    ambiarc.poiList[currentLabelId].base64 = base64String;
    $('#poi-icon-image').css('background-image','url("'+base64String+'")');

    updatePoiDetails('base64', base64String);
    showPoiDetails();
};


var importFileHandler = function(evt){

    if(!input){
        var input = $('#import-file')[0];
    }
    var file;

    if (typeof window.FileReader !== 'function') return;

    else if (!input.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else {

        file = input.files[0];
        fr = new FileReader();
        fr.onload = function(test){

            var base64result = fr.result.split(',')[1];

            try {
                parsedJson = JSON.parse(window.atob(base64result));
                fillGeoData(parsedJson);
            }
            catch(e){
                alert("Please select valid json file");
                return;
            }
        }

        fr.readAsDataURL(file);
    }
};


var fillGeoData = function(properties){

    $.each(properties.features, function(i, feature){
        var mapLabelInfo = feature.properties;
        mapLabelInfo.longitude = feature.geometry.coordinates[0];
        mapLabelInfo.latitude = feature.geometry.coordinates[1];

        ambiarc.createMapLabel(mapLabelInfo.type, mapLabelInfo,(labelId) => {
            mapLabelCreatedCallback(labelId, mapLabelInfo.label, mapLabelInfo);
        })
    })
};


var downloadObjectAsJson = function (exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};


var repositionLabel = function(){

    ambiarc.getMapPositionAtCursor(ambiarc.coordType.gps, (latlon) => {

        $('#poi-label-latitude').val(latlon.lat);
        $('#poi-label-longitude').val(latlon.lon);

        updatePoiDetails(['longitude', 'latitude'], [latlon.lat, latlon.lon]);
    });
}