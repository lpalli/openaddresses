//******************************************************************************
//this file contains quality assessment functionality for OpenAddresses project
//author: Hans-Jörg Stark
//date: April 2010
//******************************************************************************


Ext.namespace("openaddresses");

//global variables to store oid and for comparison purpose
var g_oid;
var g_str;
var g_hnr;
var g_addr;
var g_zip;
var g_city
var g_lat;
var g_lng;
var g_date;

var gcxmlHttp = createXmlHttpRequestObject(); //to process via AJAX


//**********************************************************************
//Function that handles the qa procedure when an address is altered (attributes)
//**********************************************************************
//**********************************************************************
//**********************************************************************

function qa_addrchanged(str,hnr,adrzusatz,zip,city,usr,lng,lat,oid) {
//this function handles the update of qaOA when attribute data of an address changes
//First of all check if there is already a record in qaOA

//populate global variables
g_oid = oid;
g_addr = str + " " + hnr;
g_str = str;
g_hnr = hnr;
g_zip = zip;
g_city = city;
g_lat = lat;
g_lng = lng;

var oidchk = chk4existenceinqaOA(oid);

}

function chk4existenceinqaOA(){
		//if object ready...
		if (gcxmlHttp.readyState == 4 || gcxmlHttp.readyState == 0){
			//call php file for check of qaQA 
			gcxmlHttp.open('GET', 'check4existence.php?oid='+g_oid,true);
			// Definition der Methode wie die Serverantwort weiterzuverarbeiten ist
			gcxmlHttp.onreadystatechange = handleServerResponse4chk();	
			// Server Request wird ausgeführt
			gcxmlHttp.send(null);
		} else {
			// falls die Verbindung nicht frei ist, erneuter Versuch nach 1000 msecs
			setTimeout('chk4existenceinqaOA()', 3000);
		}
}
function handleServerResponse4chk(){
        // If transaction is complete
        if (gcxmlHttp.readyState == 4){
           // If transaction was successful
           if (gcxmlHttp.status == 200){ 
             // Extract XML code
              var xml = gcxmlHttp.responseXML;
              // if xml object is not empty...
            if(xml) {
                // extract value sent back from server: 1=record exists, 0=record does not yet exist
                var existence = 1;
				existence = xml.getElementsByTagName("rec")[0].firstChild.data;

				if (existence == 0) {	//record must first be created before it is updated
					//Update table in DB on server 
					GxmlHttp = createXmlHttpRequestObject();
					//if object ready...
					if (GxmlHttp.readyState == 4 || GxmlHttp.readyState == 0){
						//call php file for update QA info
						GxmlHttp.open('GET', 'createqaOArecord.php?oid='+g_oid,true);

						// Definition der Methode wie die Serverantwort weiterzuverarbeiten ist
						GxmlHttp.onreadystatechange = handleServerResponse4creation();	//function is obsolete since there are no values coming back
						// Server Request wird ausgeführt
						GxmlHttp.send(null);
					} else {
						// falls die Verbindung nicht frei ist, erneuter Versuch nach 1000 msecs
						setTimeout('handleServerResponse4chk()', 1000);
					
					}
				} 
				//update record - the same procedure as if a new address was collected
				//call bing maps
				//send2BingGeocoder(g_addr + ", " + g_zip + " " + g_city + ",Switzerland");
				send2BingGeocoder(g_addr + ", " + g_zip + " " + g_city);
				//call google maps
				//send2GMGeocoder(g_str + "+" + g_hnr + "+" + g_zip + "+" + g_city + "+Switzerland");
				send2GMGeocoder(g_str + "+" + g_hnr + "+" + g_zip + "+" + g_city);
				//call yahoo maps
				send2YGeocoder(g_str, g_hnr, g_zip, g_city);
			}
		   }
		} else {
			setTimeout('handleServerResponse4chk()', 1000);
		}
}

function handleServerResponse4creation(){
        // If transaction is complete
        if (GxmlHttp.readyState == 4){
           // If transaction was successful
           if (GxmlHttp.status == 200){ 
		   }
		}   
		   
}	


//**********************************************************************
//Function that handles the qa procedure when an address is created
//**********************************************************************
//**********************************************************************
//**********************************************************************

function qa_ComparisonWithOWMS(str,hnr,adrzusatz,zip,city,usr,lng,lat,oid) {
//this function calls bing, google, yahoo geocoders
//populate global variables
g_oid = oid;
g_addr = str + " " + hnr;
g_zip = zip;
g_city = city;
g_lat = lat;
g_lng = lng;
getTimeStamp();



//call bing maps
//send2BingGeocoder(str + " " + hnr + ", " + zip + " " + city + ",Switzerland");
send2BingGeocoder(str + " " + hnr + ", " + zip + " " + city);

//call google maps
send2GMGeocoder(str + "+" + hnr + "+" + zip + "+" + city);

//call yahoo maps
//send2YGeocoder(str, hnr, zip, city);


}

////*******************************************************************************
////Bing*******************************************************************************
////*******************************************************************************
function send2BingGeocoder(adrInfo) {
	//processes address information from DB via Bing geocoder
	//API Info found at 
	//http://msdn.microsoft.com/en-us/library/bb429645.aspx
	//http://msdn.microsoft.com/en-us/library/bb429615.aspx and others

	results = bingmap.Find(null,adrInfo,null,null,0,1,false,false,false,false,evaluateResults);
}

function evaluateResults(layer, resultsArray, places, hasMore, veErrorMessage){
	var addr = "";
	var zip = 0;
	var city = "";
	var lat = 0;
	var lng = 0;
	var PlaceMatchCode = "";
	var PlaceMatchConfidence =  "";
	var PlacePrecision = "";
	var acc = "";
	var warn= "";

	if(places!=null)	{
	
		if (places.length>0) {
			var place = places[0];

			var addr_array=place.Name.split(",");
			lat = place.LatLong.Latitude;
			lng = place.LatLong.Longitude;

			if (addr_array.length == 1) {
				addr = "";
				zip = parseInt(addr_array[0]);
				if (zip == 0) {
					city = addr_array[0];
				} else {
					city = "";
				}
			} 
			if (addr_array.length == 2) {			  // two values comma-separated
				if (parseInt(addr_array[1].substring(1,5)) > 1000){	// first value is a valid zip code
						addr = addr_array[0];
						zip = addr_array[1].substring(1,5);
						city = addr_array[1].substring(6);
					} else {
						addr = "";
						zip = 0;
						city = addr_array[0];
					}
			}

			//Determine MatchConfidence
			if (place.MatchConfidence==VEMatchConfidence.High){
				PlaceMatchConfidence = "High";
			}
			if (place.MatchConfidence==VEMatchConfidence.Medium){
				PlaceMatchConfidence = "Medium";
			} 
			if (place.MatchConfidence==VEMatchConfidence.Low){
				PlaceMatchConfidence = "Low";
			}
			//Determine MatchCode
			if (place.MatchCode==VEMatchCode.None){
				PlaceMatchCode = "None";
			}
			if (place.MatchCode==VEMatchCode.Good){
				PlaceMatchCode = "Good";
			}
			if (place.MatchCode==VEMatchCode.Ambiguous){
				PlaceMatchCode = "Ambiguous";
			}
			if (place.MatchCode==VEMatchCode.UpHierarchy){
				PlaceMatchCode = "UpHierarchy";
			}
			if (place.MatchCode==VEMatchCode.Modified){
				PlaceMatchCode = "Modified";
			}
			//Determine LocationPrecision
			if (place.Precision==VELocationPrecision.Interpolated){
				PlacePrecision = "Interpolated";
			}
			if (place.Precision==VELocationPrecision.Rooftop){
				PlacePrecision = "Rooftop";
			}
		}
	}

		//geocoding accuracy
		acc = PlaceMatchCode + " / " + PlaceMatchConfidence + " / " + PlacePrecision;

		//Comparison of address-information
		c_addr = comparison(addr, g_addr);
		c_zip = comparison(zip, g_zip);
		c_city = comparison(city, g_city);
		//compute distance
		c_dist = computedist(g_lat, g_lng, lat, lng);

		//check geocoding precision
		if (acc.substring(0,11) == 'Good / High') {
			c_acc = "TRUE";
		} else {
			c_acc = "FALSE";
		}

		/*
		//Update table in DB on server 
		getTimeStamp();
		update_servertable('qaOA','bing_dist',c_dist,'float','oid='+g_oid);
		update_servertable('qaOA','bing_precision',c_acc,'string','oid='+g_oid);
		update_servertable('qaOA','bing_addr',c_addr,'string','oid='+g_oid);
		update_servertable('qaOA','bing_zip',c_zip,'string','oid='+g_oid);
		update_servertable('qaOA','bing_city',c_city,'string','oid='+g_oid);
		update_servertable('qaOA','date',g_date,'string','oid='+g_oid);
		*/
		
		var result = '"bing_dist":"' +c_dist + '" , "bing_addr": "' + c_addr + '", "bing_precision": "' + c_acc + '", "bing_zip": "' + c_zip + '", "bing_city": "' + c_city + '"';			

		var jsontext = '{"type":"FeatureCollection", "features":[{"type":"Feature","id":' + g_oid + ',"properties":{"id": ' + g_oid + ', ' + result + ', "date": "' + g_date + '"},"geometry":{"type":"Point","coordinates":[' + g_lng + ',' + g_lat + ']},"crs":{"type":"EPSG","properties":{"code":900913}}}]}';
		var json = eval('(' + jsontext + ')');

		var conn1 = new Ext.data.Connection();
		conn1.request({
			url: "qa",
			method: 'POST',
			jsonData: json,
			success: function(resp, opt) {
				//alert("save ok");
			},
			failure: function(resp, opt) {
				alert(OpenLayers.i18n('Error during data storage'));
			}
		});
		
		
}	//function Bing geocoding



////*******************************************************************************
////Google*******************************************************************************
////*******************************************************************************
function send2GMGeocoder(adrInfo) {
	//processes address information from DB via GM geocoder
	var geocoder = new GClientGeocoder();
	geocoder.getLocations(adrInfo, 
		function showAddress(response) {

			var lng = 0;
			var lat = 0;
			var adr = "-";
			var zip = "";
			var cty = "-";
			var acc;
			var accN = "";
			var warn = "";

			//if no good response from GM...
			if (!response || response.Status.code != 200) {
				switch (response.Status.code)
					{
					case 400:
						warn = "Bad request";
						break;
					case 500:
						warn = "Server error";
						break;
					case 601:
						warn = "Missing query parameter q";
						break;
					case 602:
						warn = "Unknown address";
						break;
					case 603:
						warn = "Unavailable address";
						break;
					case 604:
						warn = "Unknown directions";
						break;
					case 610:
						warn = "Bad key";
						break;
					case 620:
						warn = "Too many queries for this key in 24h";
						break;
					default:
					   warn ="unknown problem";
					}
			
			} else {
				place = response.Placemark[0];
				lng = place.Point.coordinates[0]
				lat = place.Point.coordinates[1];

				if (place.AddressDetails.Accuracy!=null) { 
					accN = place.AddressDetails.Accuracy;
					
					switch (accN)
					{
					case 1:
					   acc="country";
					   break;
					case 2:
					   acc="region";	//Canton
					   break;
					case 3:
					   acc="municipality";
					   break;
					case 4:
					   acc="city";
						if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea!=null) {
							if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality!=null) { 
								if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName!=null) { 
									cty = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName;
								}
							}	
						}
					   break;
					case 5:
					   acc="zip";
						if (place.AddressDetails.Country.AdministrativeArea!=null) {
							if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea!=null) {
								if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality!=null) { 
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName!=null) { 
										cty = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName;
									}
								}	
								if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode!=null) { 
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber!=null) { 
										zip = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber;
									}
								}
							}
						} else if (place.AddressDetails.Country.PostalCode!=null) {
							if (place.AddressDetails.Country.PostalCode.PostalCodeNumber!=null) {
								zip = place.AddressDetails.Country.PostalCode.PostalCodeNumber;
							}	
						}
	
					   break;
					case 6:
					   acc="street";
						if (place.AddressDetails.Country!=null) { 
							if (place.AddressDetails.Country.Thoroughfare!=null) { 
								if (place.AddressDetails.Country.Thoroughfare.ThoroughfareName!=null) { 
									adr = place.AddressDetails.Country.Thoroughfare.ThoroughfareName;
								}
							}
							if (place.AddressDetails.Country.AdministrativeArea!=null) { 
								if (place.AddressDetails.Country.AdministrativeArea.Locality!=null) { 
									if (place.AddressDetails.Country.AdministrativeArea.Locality.Thoroughfare.ThoroughfareName!=null) { 
										adr = place.AddressDetails.Country.AdministrativeArea.Locality.Thoroughfare.ThoroughfareName;
									}
									if (place.AddressDetails.Country.AdministrativeArea.Locality.PostalCode!=null) { 
										if (place.AddressDetails.Country.AdministrativeArea.Locality.PostalCode.PostalCodeNumber!=null) { 
											zip = place.AddressDetails.Country.AdministrativeArea.Locality.PostalCode.PostalCodeNumber;
										}
									}
										if (place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName!=null) { 
										cty = place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName;
									}
								}
								if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea!=null) { 
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality!=null) { 
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare!=null) { 
											if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare.ThoroughfareName!=null) { 
												adr = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare.ThoroughfareName;
											}
										}
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode!=null) { 
											if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber!=null) { 
												zip = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber;
											}
										}
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName!=null) { 
											cty = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName;
										}
									}
								}
							}
						}
						break;
					case 7:
					   acc="intersection";
					   break;
					case 8:
					   acc="address";

						if (place.AddressDetails.Country.AdministrativeArea!=null) { 
							if (place.AddressDetails.Country.AdministrativeArea.Locality!=null) { 
								if (place.AddressDetails.Country.AdministrativeArea.Locality.Thoroughfare.ThoroughfareName!=null) { 
									adr = place.AddressDetails.Country.AdministrativeArea.Locality.Thoroughfare.ThoroughfareName;
								}
								if (place.AddressDetails.Country.AdministrativeArea.Locality.PostalCode.PostalCodeNumber!=null) { 
									zip = place.AddressDetails.Country.AdministrativeArea.Locality.PostalCode.PostalCodeNumber;
								}
								if (place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName!=null) { 
									cty = place.AddressDetails.Country.AdministrativeArea.Locality.LocalityName;
								}
							}
							if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea!=null) { 
								if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality!=null) { 
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare!=null) { 
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare.ThoroughfareName!=null) { 
											adr = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.Thoroughfare.ThoroughfareName;
										}
									}
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality!=null) { 
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.Thoroughfare!=null) { 
											if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.Thoroughfare.ThoroughfareName!=null) { 
												adr = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.Thoroughfare.ThoroughfareName;
												}
										}
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.PostalCode!=null) { 
											if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.PostalCode.PostalCodeNumber!=null) { 
												zip = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.PostalCode.PostalCodeNumber;
											}
										}
									}
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode!=null) { 
										if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber!=null) { 
											zip = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.PostalCode.PostalCodeNumber;
										}
									}
									if (place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName!=null) { 
										cty = place.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName;
									}
								}
							}
						}	
					   break;
					default:
					   acc="-";
					}
				}
			
			} //if - response ok

			//Comparison of address-information
			c_addr = comparison(adr, g_addr);
			c_zip = comparison(zip, g_zip);
			c_city = comparison(cty, g_city);
			//compute distance
			c_dist = computedist(g_lat, g_lng, lat, lng);

			//check geocoding precision
			if (acc == 'address') {
				c_acc = "TRUE";
			} else {
				c_acc = "FALSE";
			}
		
			var result = '"google_dist":"' +c_dist + '" , "google_addr": "' + c_addr + '", "google_precision": "' + c_acc + '", "google_zip": "' + c_zip + '", "google_city": "' + c_city + '"';			

			var jsontext = '{"type":"FeatureCollection", "features":[{"type":"Feature","id":' + g_oid + ',"properties":{"id": ' + g_oid + ', ' + result + ', "date": "' + g_date + '"},"geometry":{"type":"Point","coordinates":[' + g_lng + ',' + g_lat + ']},"crs":{"type":"EPSG","properties":{"code":900913}}}]}';
			var json = eval('(' + jsontext + ')');

			var conn1 = new Ext.data.Connection();
			conn1.request({
				url: "qa",
				method: 'POST',
				jsonData: json,
				success: function(resp, opt) {
					//alert("save ok");
				},
				failure: function(resp, opt) {
					alert(OpenLayers.i18n('Error during data storage'));
				}
			});

		}
	)	
}


////*******************************************************************************
////Yahoo*******************************************************************************
////*******************************************************************************
function send2YGeocoder(curstr, curhnr, curzip, curcity) {
	if (gcxmlHttp.readyState == 4 || gcxmlHttp.readyState == 0){

		var url2gc; 
		url2gc = "?addr=" + curstr + "+" + curhnr + "&zip=" + curzip + "&city=" + curcity
		gcxmlHttp.open('GET','yahoo_geocoding.php' + url2gc,true);
		gcxmlHttp.send(null);
		chk=0;
		gcxmlHttp.onreadystatechange = handleYahooServerGeocodingResponse;
	}
}

function handleYahooServerGeocodingResponse() {
//if(chk==0) {

	var lng = 0;
	var lat = 0;
	var adr = "-";
	var zip = 0;
	var cty = "-";
	var acc;
	var warn = "";
	var cnt = 0;

	// If transaction is complete...

	if (gcxmlHttp.readyState == 4){
	   // transaction was complete and successful
	   if (gcxmlHttp.status == 200){
			//process RETURN XML
			var resxml = gcxmlHttp.responseXML;
			// if XML object is not empty...
			if(resxml) {
				cnt = resxml.getElementsByTagName("cnt")[0].firstChild.data;					
				lng = resxml.getElementsByTagName("lon")[0].firstChild.data;					
				lat = resxml.getElementsByTagName("lat")[0].firstChild.data;					
				addr = resxml.getElementsByTagName("addr")[0].firstChild.data;					
				zip = resxml.getElementsByTagName("zip")[0].firstChild.data;					
				city = resxml.getElementsByTagName("city")[0].firstChild.data;					
				acc = resxml.getElementsByTagName("precision")[0].firstChild.data;					
				warn = resxml.getElementsByTagName("warning")[0].firstChild.data;					

				if (warn.substring(0,5) != 'Error') {		//only if a reasonable response from yahoo is available

					//Comparison of address-information
					c_addr = comparison(addr, g_addr);
					c_zip = comparison(zip, g_zip);
					c_city = comparison(city, g_city);
					//compute distance
					c_dist = computedist(g_lat, g_lng, lat, lng);

					//check geocoding precision
					if (acc == 'address') {
						c_acc = 1;
					} else {
						c_acc = 0;
					}

					//Update table in DB on server 
					getTimeStamp();
					update_servertable('qaOA','yahoo_dist',c_dist,'float','oid='+g_oid);
					update_servertable('qaOA','yahoo_precision',c_acc,'string','oid='+g_oid);
					update_servertable('qaOA','yahoo_addr',c_addr,'string','oid='+g_oid);
					update_servertable('qaOA','yahoo_zip',c_zip,'string','oid='+g_oid);
					update_servertable('qaOA','yahoo_city',c_city,'string','oid='+g_oid);
					update_servertable('qaOA','date',g_date,'string','oid='+g_oid);

				} 
			}
		}
	}
}	
////*******************************************************************************
////general functions**************************************************************
////*******************************************************************************
function comparison(val1, val2) {
		//Comparison of address-information
		if (val1 == val2) {	//str & hnr are equal
			return 'TRUE';
		} else {
			return 'FALSE';	
		}
}

function computedist(lat1, lon1, lat2, lon2) {
//source: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	var R = 6371; // Radius of the earth in km
	var dLat = (lat2-lat1)/180*Math.PI;  // Javascript functions in radians
	var dLon = (lon2-lon1)/180*Math.PI; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1/180*Math.PI) * Math.cos(lat2/180*Math.PI) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km

	return d.toPrecision(10)*1000;

}

function update_servertable(table,attribute,value,type,condition){

//alert('updatetable.php?table='+table+'&attribute='+attribute+'&type='+type+'&value='+value+'&condition='+condition);
		//Update table in DB on server 
		GxmlHttp = createXmlHttpRequestObject();
		//if object ready...
		if (GxmlHttp.readyState == 4 || GxmlHttp.readyState == 0){
			//call php file for update QA info
			GxmlHttp.open('GET', 'updatetable.php?table='+table+'&attribute='+attribute+'&type='+type+'&value='+value+'&condition='+condition,true);
			// Definition der Methode wie die Serverantwort weiterzuverarbeiten ist
			GxmlHttp.onreadystatechange = handleServerResponse4update();	//function is obsolete since there are no values coming back
			// Server Request wird ausgeführt
			GxmlHttp.send(null);
		} else {
			// falls die Verbindung nicht frei ist, erneuter Versuch nach 1000 msecs
			setTimeout('update_servertable('+table+','+attribute+','+value+','+type+','+condition+')', 1000);
		
		}
}
function handleServerResponse4update(){
        // If transaction is complete
        if (GxmlHttp.readyState == 4){
           // If transaction was successful
           if (GxmlHttp.status == 200){ 
		   }
		}   
		   
}		   
function createXmlHttpRequestObject(){
// Create XMLHttpRequest object
// Based on script of Prof. Hans-Jörg Stark, FHNW, unpublished
   // if iEx
   if(window.ActiveXObject){
     try{
         xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
     }
     catch (e){
         xmlHttp = false;
     }
   }
   // if Mozilla or other browser
   else{
     try{
         xmlHttp = new XMLHttpRequest();
     }
     catch (e){
         xmlHttp = false;
     }
   }
   // returns object or error message
   if (!xmlHttp)
     alert("Error creating the XMLHttpRequest object.");
   else
     return xmlHttp;
}

function getTimeStamp() {
//get cur timestamp
var d = new Date();
var ts;
ts=d.getFullYear();
if(d.getMonth()<9){
	ts = ts + "-0" + (d.getMonth()+1);
} else {
	ts=ts+ "-" + (d.getMonth()+1);
}
if(d.getDate()<9){
	ts = ts + "-0" + (d.getDate());
} else {
	ts=ts+ "-" + (d.getDate());
}
if(d.getHours()<9){
	ts = ts + "-0" + (d.getHours());
} else {
	ts=ts+ "-" + (d.getHours());
}
if(d.getMinutes()<9){
	ts = ts + ":0" + (d.getMinutes());
} else {
	ts=ts+ ":" + (d.getMinutes());
}
if(d.getSeconds()<9){
	ts = ts + ":0" + (d.getSeconds());
} else {
	ts=ts+ ":" + (d.getSeconds());
}
g_date=ts;

}