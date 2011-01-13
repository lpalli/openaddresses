# -*- coding: utf-8 -*-
<html xmlns="http://www.w3.org/1999/xhtml" lang="${c.lang}" xml:lang="${c.lang}">
<head>

    <!--
    Site developed with MapFish (http://www.mapfish.org) framework technology
    -->

    <meta http-equiv="Content-Type" content="text/html; charset=${c.charset}"/>
    <meta name="content-language" content="${c.lang}"/>
    <title>OpenAddresses.org</title>
    <meta name="Generator" content="MapFish - 2010"/>
    <meta name="revisit-after" content="7 days"/>
    <meta name="robots" content="index,follow "/>
    <STYLE TYPE="text/css">
        <!--
        BODY {
            font-family: tahoma,arial,verdana,sans-serif;
            font-size:11px;
            line-height:1.5;
        }
        table {
            font-size: 11px;
        }

        -->
    </STYLE>

</head>

<body>
<form><input type="hidden" id="lang" value="${c.lang}"/></form>

<h3>Statistics Report for <FONT SIZE=+1> ${c.count}</FONT> OpenAddresses Objects</h3>

<table>
<tr>
	<td><b>id</b></td>
	<td><b>User</b></td>
	<td><b>Street</b></td>
	<td><b>Number</b></td>
	<td><b>Housename</b></td>
	<td><b>Zip code</b></td>
	<td><b>City</b></td>
	<td><b>Country</b></td>
	<td><b>Time created</b></td>
	<td><b>Time updated</b></td>
	<td><b>Longitude</b></td>
	<td><b>Latitude</b></td>
	
</tr>
% for row in c.statCreator:
   <tr>
   % for column in row:
      <td>${column}</td>
   % endfor
   </tr>
% endfor

</table>

</body>
</html>