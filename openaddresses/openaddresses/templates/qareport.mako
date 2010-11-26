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


<h3>${_('QA Report for ')}: ${c.count} ${_(' addresses ')}</h3>

<table>
<tr>
	<td><b>id</b></td>
	<td><b>User</b></td>
	<td><b>Street</b></td>
	<td><b>Number</b></td>
	<td><b>Zip code</b></td>
	<td><b>City</b></td>
	<td><b>Country</b></td>
	<td><b>Bing Distance</b></td>
	<td><b>Bing Address</b></td>
	<td><b>Bing Zip</b></td>
	<td><b>Bing City</b></td>
	<td><b>Bing Precision</b></td>
	<td><b>Google Distance</b></td>
	<td><b>Google Address</b></td>
	<td><b>Google Zip</b></td>
	<td><b>Google City</b></td>
	<td><b>Google Precision</b></td>
	<td><b>Date</b></td>
</tr>

% for row in c.qaCreator:
   <tr>
   % for column in row:
      % if str(type(column)).find('float') == 7:
         % if column > 60:
           <td align="right" bgcolor=#FF3300>${column}</td>
         % elif (column > 40 and column <= 60):
           <td align="right" bgcolor=#FFCC00>${column}</td>
         % elif (column > 20 and column <= 40):
           <td align="right" bgcolor=#009966>${column}</td>
         % else:
           <td align="right" bgcolor=#66CC00>${column}</td>
         % endif
      % else:
         % if column == "True":
              <td align="right" bgcolor=#66CC00>${column}</td>
         % elif column == "False":
              <td align="right" bgcolor=#FF3300>${column}</td>
         % elif column == "None":
              <td align="right" bgcolor=#FFFFCC>${column}</td>
         % else:
              <td align="right" bgcolor=#FFFFFF>${column}</td>
         % endif
      % endif
   % endfor
   </tr>
% endfor
</table>

</body>
</html>