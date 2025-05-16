var map, layer
var gridBounds = new OpenLayers.Bounds(-550.0, -550.0, 550.0, 550.0);
//var pic = "http://map.theriansaga-wiki.ru/";
//var pic = "http://thesaga.mcwees.ru/";
var pic = "/";


function init() {
  // Карта
  map = new OpenLayers.Map(
    'map',
    {
      controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.MousePosition({  numDigits: 1 }),
        new OpenLayers.Control.PanZoomBar(),
        new OpenLayers.Control.ArgParser(),
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.LayerSwitcher()
      ],
      maxExtent : gridBounds,
      minResolution: 0.05,
      numZoomLevels: 6
    }
  );
  
  // Map layer
  layer = new OpenLayers.Layer.XYZ("Map layer",
		pic+"images/map/${z}/${x}_${y}.jpg", {
    transitionEffect: 'resize',
    tileSize: new OpenLayers.Size(256, 256),
    tileOrigin: new OpenLayers.LonLat(gridBounds.left, gridBounds.top),
    zoomOffset: 10
  });
  map.addLayer(layer,'abc');

  layerLoc = new OpenLayers.Layer.XYZ("Map layer",
		  pic + "images/map/" + "${z}/${x}_${y}.jpg", {
    transitionEffect: 'resize',
    tileSize: new OpenLayers.Size(256, 256),
    tileOrigin: new OpenLayers.LonLat(gridBounds.left, gridBounds.top),
    zoomOffset: 10
  });
  map.addLayer(layerLoc);
    
  map.setCenter(new OpenLayers.LonLat(18, 181), 5);
  
  map.events.on({ "zoomend": function (e) {
    if (this.getZoom() > 3) {
      vectorImageLayer.setVisibility(true);
      layerLoc.setVisibility(false);
      layer.setVisibility(true);
      map.setBaseLayer(layer);
    }
    else {
      vectorImageLayer.setVisibility(false);
      layerLoc.setVisibility(true);
      layer.setVisibility(false);
      map.setBaseLayer(layerLoc);
    }
  }
  
});
  
  var markers = new OpenLayers.Layer.Markers( "Markers");
  //map.addLayer(markers);

  var vectorImageStyle = new OpenLayers.Style({
    pointRadius: 6,
    graphicOpacity: 1,
    graphicWidth: '${width}',
    graphicHeight: '${height}',
    externalGraphic: '${icon}',
    fillOpacity: 0.1,
    strokeOpacity: 0.4,
    strokeWidth: 0.7,
    cursor: 'pointer'
  });
  
  var defaultStyle = new OpenLayers.Style({
    pointRadius: 6,
  	fillOpacity: 0.1,
   	strokeOpacity: 0.4,
   	strokeWidth: 0.7,
   	cursor: 'pointer'
  })

  var selectStyle = new OpenLayers.Style({
  	fillOpacity: 0.8,
  	fillColor: '#779ecb'
  });
  
  var styleMapImage = new OpenLayers.StyleMap({'default': vectorImageStyle,
	  'select': selectStyle});
	vectorImageLayer = new OpenLayers.Layer.Vector("ZoomMax",
			{styleMap: styleMapImage});
  map.addLayer(vectorImageLayer);

  var styleMap = new OpenLayers.StyleMap({'default': defaultStyle, 'select': selectStyle});
  vectorLayer = new OpenLayers.Layer.Vector("Select Boxes", {styleMap: styleMap});
  selectControl = new OpenLayers.Control.SelectFeature(vectorImageLayer, {
    onSelect: onFeatureSelect,
    onUnselect: onFeatureUnselect
  });
  map.addLayer(vectorLayer);
    
  var zl=0.05;  
	var location_select = document.getElementById('feature_selector');
	var pointFeature = [];
	locations.forEach(function(entry){
    if (entry.SizeLevel==2) {
      vectorImageLayer.addFeatures(
        new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Point(entry.LocationX, entry.LocationY+entry.SignH*zl/2),
          {
            width: entry.SignW,
            height: entry.SignH,
            icon: pic+'images/map/'+entry.Sign+'.png',
            title: entry.Name,
            terrain_type: entry.LandformID,
            terrain_value: entry.Difficulty,
            concealment: entry.concealment,
            wiki: entry.wiki,
            wikiAdd: entry.wikiAdd
          }
        )
      );
    };
    if (entry.SizeLevel==3) {
      map.addLayer(
        new OpenLayers.Layer.Image(
          'Image_'+entry.Figure.ImageID,
          pic+'images/map/'+entry.Figure.ImageID+'.png',
          new OpenLayers.Bounds(entry.LocationX-entry.Figure.CenterX*zl, entry.LocationY+entry.Figure.CenterY*zl-entry.Figure.H*zl, entry.LocationX-entry.Figure.CenterX*zl+entry.Figure.W*zl, entry.LocationY+entry.Figure.CenterY*zl),
          new OpenLayers.Size(entry.SignW,entry.SignH),
          {'isBaseLayer': false,'alwaysInRange': true}
        )
      );
      vectorImageLayer.addFeatures(
        new OpenLayers.Feature.Vector(
          //new OpenLayers.Bounds(entry.coords.x-entry.coords.cX*zl, entry.coords.y+entry.coords.cY*zl-entry.coords.h*zl, entry.coords.x-entry.coords.cX*zl+entry.coords.w*zl, entry.coords.y+entry.coords.cY*zl).toGeometry(),
          new OpenLayers.Bounds(entry.LocationX-entry.Figure.CenterX*zl, entry.LocationY+entry.Figure.CenterY*zl-entry.Figure.H*zl, entry.LocationX-entry.Figure.CenterX*zl+entry.Figure.W*zl, entry.LocationY+entry.Figure.CenterY*zl).toGeometry(),
          {
            width: entry.Figure.W,
            height: entry.Figure.H,
            title: entry.Name,
            terrain_type: entry.LandformID,
            terrain_value: entry.Difficulty,
            concealment: entry.concealment,
            wiki: entry.wiki,
            wikiAdd: entry.wikiAdd
          }
        )
      );
    };
    var opt = document.createElement('option');
    opt.value = entry.Name;
    opt.innerHTML = entry.Name;
    location_select.appendChild(opt);
  });

  if (typeof tasks != "undefined") {
  tasks.forEach(function(entry){
    var tasks_coords = [];
    entry.coords.forEach(function(point){
      tasks_coords.push(
        new OpenLayers.Bounds(point.x-0.5, point.y-0.5,point.x+0.5, point.y+0.5).toGeometry()
    )});
    vectorImageLayer.addFeatures(
      new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Collection(tasks_coords),
        {
          title: entry.title
    }));
    SelectFeature(entry.title);
  });
  };
  //var quest_select = document.getElementById('quest_selector');
  //quests.forEach(function(entry){
  //  var quest_coords = [];
  //  entry.coords.forEach(function(point){
  //    quest_coords.push(
  //      new OpenLayers.Bounds(point.x-0.5, point.y-0.5,point.x+0.5, point.y+0.5).toGeometry()
  //      //new OpenLayers.Geometry.Point(point.x, point.y)
  //  )});
  //  vectorImageLayer.addFeatures(
  //    new OpenLayers.Feature.Vector(
  //      new OpenLayers.Geometry.Collection(quest_coords),
  //      {
  //        title: entry.title,
  //        wikiAdd: entry.wikiAdd
  //  }));
  //  var opt = document.createElement('option');
  // opt.value = entry.title;
  //  opt.innerHTML = entry.title;
  //  quest_select.appendChild(opt);
  //});


  //var tstColl = [];
  //tstColl.push(
  //  new OpenLayers.Bounds(0,170,1,171).toGeometry()
  //);
  //tstColl.push(
  //  new OpenLayers.Bounds(0,160,1,161).toGeometry()
  //);
  //vectorImageLayer.addFeatures(
  //  new OpenLayers.Feature.Vector(
  //    new OpenLayers.Geometry.Collection(tstColl),
  //    {
  //      title: 'test'
  //    }
  //  )
  //);
  

  map.addControl(selectControl);
  selectControl.activate();
  if (linked_location != "") {
    if (false === SelectFeature(linked_location)) {
      SelectQuest(linked_location);
    }
  }
  resize();
}

function toggleControl(element) {
  for (key in drawControls) {
    var control = drawControls[key];
    if (element.value == key && element.checked) {
      control.activate();
    } else {
      control.deactivate();
    }
  }
}

function onPopupClose(evt) {
  selectControl.unselect(selectedFeature);
}

function onFeatureSelect(feature) {
  selectedFeature = feature;
  var popup_text = "<div style='font-size:1.2em'><strong>"+feature.attributes.title+"</strong>";
  if (feature.attributes.hasOwnProperty('terrain_type') && feature.attributes.terrain_type != '')	{
    popup_text += "<br/>"+feature.attributes.terrain_type+": "+feature.attributes.terrain_value;
  }
  if (feature.attributes.hasOwnProperty('concealment'))	{
    popup_text += "<br />"+cons+": "+feature.attributes.concealment;
	}
  var wiki_link = feature.attributes.title;
  wiki_link = wiki_link.replace(/ /g, "_");
  if (!(typeof feature.attributes.wikiAdd === 'undefined')) {
    wiki_link=feature.attributes.title + feature.attributes.wikiAdd;
  } 
  if (lang=='ru') popup_text += "<br /><a href=\"http://thesaga.mcwees.ru/places/"+encodeURIComponent(wiki_link)+".html\" target=\"_blank\">Описание</a>";
  popup_text += "</div>";

  var popup = new OpenLayers.Popup.FramedCloud(
    "chicken",
    feature.geometry.getBounds().getCenterLonLat(),
    null,
    popup_text,
    null, true, onPopupClose
  );
  feature.popup = popup;
  map.addPopup(popup);
}

function onFeatureUnselect(feature) {
  map.removePopup(feature.popup);
  feature.popup.destroy();
  feature.popup = null;
}

function getURL(bounds) {
  bounds = this.adjustBounds(bounds);
  var res = this.getServerResolution();
  var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
  var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
  var z = this.getServerZoom();
  var path = this.serviceVersion + "/" + this.layername + "/" + z + "/" + x + "/" + y + "." + this.type;
  var url = this.url;
  if (OpenLayers.Util.isArray(url))
  {
    url = this.selectUrl(path, url);
  }
  if (mapBounds.intersectsBounds(bounds) && (z >= mapMinZoom) && (z <= mapMaxZoom)) {
    return url + path;
  } else {
    return emptyTileURL;
  }
}

function getWindowHeight() {
  if (self.innerHeight) return self.innerHeight;
  if (document.documentElement && document.documentElement.clientHeight)
    return document.documentElement.clientHeight;
  if (document.body) return document.body.clientHeight;
  return 0;
}

function getWindowWidth() {
  if (self.innerWidth) return self.innerWidth;
  if (document.documentElement && document.documentElement.clientWidth)
    return document.documentElement.clientWidth;
  if (document.body) return document.body.clientWidth;
  return 0;
}

function resize() {
  var map = document.getElementById("map");
  var side = document.getElementById("side");
  map.style.height = (getWindowHeight() - 20) + "px";
  if (inline)
    map.style.width = (getWindowWidth() - 20) + "px";
  else
    map.style.width = (getWindowWidth() - 200 - 20) + "px";
  side.style.height = (getWindowHeight() - 20) + "px";
  if (map.updateSize)
    map.updateSize();
}

onresize = function () {
  resize();
};

function SelectFeature(selection) {
  var selected_feature = vectorImageLayer.getFeaturesByAttribute('title',selection);
  
  if (selected_feature.length == 1) {
    map.setCenter(selected_feature[0].geometry.getBounds().getCenterLonLat(),5);
    selectControl.select(selected_feature[0]);
    return true;
  }
  return false;
}

function SelectQuest(selection) {
  var selected_quest = vectorImageLayer.getFeaturesByAttribute('title',selection);
  if (selected_quest.length == 1) {
    map.setCenter(selected_quest[0].geometry.getBounds().getCenterLonLat(),5);
    selectControl.select(selected_quest[0]);
    return true;
  }
	return false;
}

