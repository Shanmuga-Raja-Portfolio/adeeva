# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 3 |
| Informational | 9 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Info | Informational | http://host.docker.internal:6220 | Percentage of responses with status code 2xx | 100 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type application/manifest+json | 1 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type image/png | 1 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type image/svg+xml | 1 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type text/css | 17 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type text/html | 4 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with content type text/javascript | 74 % |
| Info | Informational | http://host.docker.internal:6220 | Percentage of endpoints with method GET | 100 % |
| Info | Informational | http://host.docker.internal:6220 | Count of total endpoints | 74    |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Cross-Origin-Embedder-Policy Header Missing or Invalid | Low | 3 |
| Cross-Origin-Resource-Policy Header Missing or Invalid | Low | Systemic |
| Timestamp Disclosure - Unix | Low | 1 |
| Base64 Disclosure | Informational | 8 |
| Information Disclosure - Information in Browser localStorage | Informational | 2 |
| Modern Web Application | Informational | 2 |
| Sec-Fetch-Dest Header is Missing | Informational | 4 |
| Sec-Fetch-Mode Header is Missing | Informational | 4 |
| Sec-Fetch-Site Header is Missing | Informational | 4 |
| Sec-Fetch-User Header is Missing | Informational | 4 |
| Storable and Cacheable Content | Informational | 2 |
| Storable but Non-Cacheable Content | Informational | Systemic |




## Alert Detail



### [ Cross-Origin-Embedder-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: http://host.docker.internal:6220/
  * Node Name: `http://host.docker.internal:6220/`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/robots.txt
  * Node Name: `http://host.docker.internal:6220/robots.txt`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/sitemap.xml
  * Node Name: `http://host.docker.internal:6220/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 3

### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Cross-Origin-Resource-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/assets/profile-D6--OydM.js
  * Node Name: `http://host.docker.internal:6220/assets/profile-D6--OydM.js`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Timestamp Disclosure - Unix ](https://www.zaproxy.org/docs/alerts/10096/)



##### Low (Low)

### Description

A timestamp was disclosed by the application/web server. - Unix

* URL: http://host.docker.internal:6220/assets/profile-D6--OydM.js
  * Node Name: `http://host.docker.internal:6220/assets/profile-D6--OydM.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1831565813`
  * Other Info: `1831565813, which evaluates to: 2028-01-15 16:16:53.`


Instances: 1

### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Base64 Disclosure ](https://www.zaproxy.org/docs/alerts/10094/)



##### Informational (Medium)

### Description

Base64 encoded data was disclosed by the application/web server. Note: in the interests of performance not all base64 strings in the response were analyzed individually, the entire response should be looked at by the analyst/security team/developer(s).

* URL: http://host.docker.internal:6220/assets/AdeevaGame-BJeeEX7B.js
  * Node Name: `http://host.docker.internal:6220/assets/AdeevaGame-BJeeEX7B.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/ChefGame-U8OtCXcI.js
  * Node Name: `http://host.docker.internal:6220/assets/ChefGame-U8OtCXcI.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/InteriorGame-CFB8Tu_N.js
  * Node Name: `http://host.docker.internal:6220/assets/InteriorGame-CFB8Tu_N.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/JewelleryGame-CYxQ49tD.js
  * Node Name: `http://host.docker.internal:6220/assets/JewelleryGame-CYxQ49tD.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/PatisserieGame-CovMN06n.js
  * Node Name: `http://host.docker.internal:6220/assets/PatisserieGame-CovMN06n.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/ThriftFlipGame-m1YaFQta.js
  * Node Name: `http://host.docker.internal:6220/assets/ThriftFlipGame-m1YaFQta.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/WorkshopGame-DA32_DPh.js
  * Node Name: `http://host.docker.internal:6220/assets/WorkshopGame-DA32_DPh.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`
* URL: http://host.docker.internal:6220/assets/index-CgnW7Ejk.js
  * Node Name: `http://host.docker.internal:6220/assets/index-CgnW7Ejk.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `assets/useGameSession-DWCsr4Ay`
  * Other Info: `j����ᚙ䞲Ȩ���
��`


Instances: 8

### Solution

Manually confirm that the Base64 data does not leak sensitive information, and that the data cannot be aggregated/used to exploit other vulnerabilities.

### Reference


* [ https://projects.webappsec.org/w/page/13246936/Information%20Leakage ](https://projects.webappsec.org/w/page/13246936/Information%20Leakage)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 13

#### Source ID: 3

### [ Information Disclosure - Information in Browser localStorage ](https://www.zaproxy.org/docs/alerts/120000/)



##### Informational (High)

### Description

Information was stored in browser localStorage.
This is not unusual or necessarily unsafe - this informational alert has been raised to help you get a better understanding of what this app is doing. For more details see the Client tabs - this information was set directly in the browser and will therefore not necessarily appear in this form in any HTTP(S) messages.

* URL: http://host.docker.internal:6220/%23/chef
  * Node Name: `http://host.docker.internal:6220/`
  * Method: `GET`
  * Parameter: `studio.playtime`
  * Attack: ``
  * Evidence: ``
  * Other Info: `The following data (key=value) was set: studio.playtime={"version":1,"seconds":{"patisserie":4}}
Note that this alert will only be raised once for each URL + key.`
* URL: http://host.docker.internal:6220/
  * Node Name: `http://host.docker.internal:6220/`
  * Method: `GET`
  * Parameter: `studio.profile`
  * Attack: ``
  * Evidence: ``
  * Other Info: `The following data (key=value) was set: studio.profile={"version":1,"name":"","look":{"skinTone":"honey","hairStyle":"long-waves","hairColour":"dark-brown","outfit":"studio-apron"},"accessory":null,"theme":"morning","perks":[]}
Note that this alert will only be raised once for each URL + key.`


Instances: 2

### Solution

This is an informational alert and no action is necessary. 

### Reference



#### CWE Id: [ 359 ](https://cwe.mitre.org/data/definitions/359.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Client Spider may well be more effective than the standard one.

* URL: http://host.docker.internal:6220/
  * Node Name: `http://host.docker.internal:6220/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CgnW7Ejk.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: http://host.docker.internal:6220/sitemap.xml
  * Node Name: `http://host.docker.internal:6220/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script type="module" crossorigin src="/assets/index-CgnW7Ejk.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 2

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Sec-Fetch-Dest Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies how and where the data would be used. For instance, if the value is audio, then the requested resource must be audio data and not any other type of resource.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

Ensure that Sec-Fetch-Dest header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Dest)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Mode Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Allows to differentiate between requests for navigating between HTML pages and requests for loading resources like images, audio etc.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

Ensure that Sec-Fetch-Mode header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Mode)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Site Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies the relationship between request initiator's origin and target's origin.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

Ensure that Sec-Fetch-Site header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-User Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies if a navigation request was initiated by a user.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: http://host.docker.internal:6220/assets/index-CEPDn-Cr.css
  * Node Name: `http://host.docker.internal:6220/assets/index-CEPDn-Cr.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``
* URL: http://host.docker.internal:6220/assets/profile-D6--OydM.js
  * Node Name: `http://host.docker.internal:6220/assets/profile-D6--OydM.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `max-age=31536000`
  * Other Info: ``


Instances: 2

### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable but Non-Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, but will not be retrieved directly from the cache, without validating the request upstream, in response to similar requests from other users.

* URL: http://host.docker.internal:6220/
  * Node Name: `http://host.docker.internal:6220/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-cache`
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/apple-touch-icon.png
  * Node Name: `http://host.docker.internal:6220/icons/apple-touch-icon.png`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-cache`
  * Other Info: ``
* URL: http://host.docker.internal:6220/icons/maker-studio.svg
  * Node Name: `http://host.docker.internal:6220/icons/maker-studio.svg`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-cache`
  * Other Info: ``
* URL: http://host.docker.internal:6220/manifest.webmanifest
  * Node Name: `http://host.docker.internal:6220/manifest.webmanifest`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-cache`
  * Other Info: ``
* URL: http://host.docker.internal:6220/sitemap.xml
  * Node Name: `http://host.docker.internal:6220/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-cache`
  * Other Info: ``

Instances: Systemic


### Solution



### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


