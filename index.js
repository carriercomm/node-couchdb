/*
The MIT License

Copyright 2012-2014 (c) Peter Širka <petersirka@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var parser = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var notvalid = 'Document hasn\'t id or _rev attribute.';

if (typeof(setImmediate) === 'undefined')
	setImmediate = process.nextTick;

/*
	CouchDB class
	@connectionString {String} :: url address
*/
function CouchDB(connectionString) {

	if (connectionString[connectionString.length - 1] !== '/')
		connectionString += '/';

	this.uri = parser.parse(connectionString);
	this.view = new Views(this);
	this.attachment = new Attachment(this);
}

function Views(couchdb) {
	this.db = couchdb;
}

function Attachment(couchdb) {
	this.db = couchdb;
}

// ======================================================
// FUNCTIONS
// ======================================================

function JSON_parse(value, without) {

	if (!JSON_valid(value))
		return {};

	if (!without)
		return JSON.parse(value);

	if (typeof(without) === 'string')
		without = [without];

	return JSON.parse(value, function(key, value) {
		if (without.indexOf(key) === -1)
			return value;
	});

}

function JSON_valid(value) {
	value = value.toString();

	if (value.length <= 1)
		return false;

	var a = value[0];
	var b = value[value.length - 1];
	return (a === '"' && b === '"') || (a === '[' && b === ']') || (a === '{' && b === '}');
}

function CouchDB_extension(ext) {

	if (ext[0] === '.')
		ext = ext.substring(1);

	var extension = {
		'ai': 'application/postscript',
		'aif': 'audio/x-aiff',
		'aifc': 'audio/x-aiff',
		'aiff': 'audio/x-aiff',
		'asc': 'text/plain',
		'atom': 'application/atom+xml',
		'au': 'audio/basic',
		'avi': 'video/x-msvideo',
		'bcpio': 'application/x-bcpio',
		'bin': 'application/octet-stream',
		'bmp': 'image/bmp',
		'cdf': 'application/x-netcdf',
		'cgm': 'image/cgm',
		'class': 'application/octet-stream',
		'cpio': 'application/x-cpio',
		'cpt': 'application/mac-compactpro',
		'csh': 'application/x-csh',
		'css': 'text/css',
		'dcr': 'application/x-director',
		'dif': 'video/x-dv',
		'dir': 'application/x-director',
		'djv': 'image/vnd.djvu',
		'djvu': 'image/vnd.djvu',
		'dll': 'application/octet-stream',
		'dmg': 'application/octet-stream',
		'dms': 'application/octet-stream',
		'doc': 'application/msword',
		'dtd': 'application/xml-dtd',
		'dv': 'video/x-dv',
		'dvi': 'application/x-dvi',
		'dxr': 'application/x-director',
		'eps': 'application/postscript',
		'etx': 'text/x-setext',
		'exe': 'application/octet-stream',
		'ez': 'application/andrew-inset',
		'gif': 'image/gif',
		'gram': 'application/srgs',
		'grxml': 'application/srgs+xml',
		'gtar': 'application/x-gtar',
		'hdf': 'application/x-hdf',
		'hqx': 'application/mac-binhex40',
		'htm': 'text/html',
		'html': 'text/html',
		'ice': 'x-conference/x-cooltalk',
		'ico': 'image/x-icon',
		'ics': 'text/calendar',
		'ief': 'image/ief',
		'ifb': 'text/calendar',
		'iges': 'model/iges',
		'igs': 'model/iges',
		'jnlp': 'application/x-java-jnlp-file',
		'jp2': 'image/jp2',
		'jpe': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'jpg': 'image/jpeg',
		'js': 'application/x-javascript',
		'kar': 'audio/midi',
		'latex': 'application/x-latex',
		'lha': 'application/octet-stream',
		'lzh': 'application/octet-stream',
		'm3u': 'audio/x-mpegurl',
		'm4a': 'audio/mp4a-latm',
		'm4b': 'audio/mp4a-latm',
		'm4p': 'audio/mp4a-latm',
		'm4u': 'video/vnd.mpegurl',
		'm4v': 'video/x-m4v',
		'mac': 'image/x-macpaint',
		'man': 'application/x-troff-man',
		'mathml': 'application/mathml+xml',
		'me': 'application/x-troff-me',
		'mesh': 'model/mesh',
		'mid': 'audio/midi',
		'midi': 'audio/midi',
		'mif': 'application/vnd.mif',
		'mov': 'video/quicktime',
		'movie': 'video/x-sgi-movie',
		'mp2': 'audio/mpeg',
		'mp3': 'audio/mpeg',
		'mp4': 'video/mp4',
		'mpe': 'video/mpeg',
		'mpeg': 'video/mpeg',
		'mpg': 'video/mpeg',
		'mpga': 'audio/mpeg',
		'ms': 'application/x-troff-ms',
		'msh': 'model/mesh',
		'mv4': 'video/mv4',
		'mxu': 'video/vnd.mpegurl',
		'nc': 'application/x-netcdf',
		'oda': 'application/oda',
		'ogg': 'application/ogg',
		'pbm': 'image/x-portable-bitmap',
		'pct': 'image/pict',
		'pdb': 'chemical/x-pdb',
		'pdf': 'application/pdf',
		'pgm': 'image/x-portable-graymap',
		'pgn': 'application/x-chess-pgn',
		'pic': 'image/pict',
		'pict': 'image/pict',
		'png': 'image/png',
		'pnm': 'image/x-portable-anymap',
		'pnt': 'image/x-macpaint',
		'pntg': 'image/x-macpaint',
		'ppm': 'image/x-portable-pixmap',
		'ppt': 'application/vnd.ms-powerpoint',
		'ps': 'application/postscript',
		'qt': 'video/quicktime',
		'qti': 'image/x-quicktime',
		'qtif': 'image/x-quicktime',
		'ra': 'audio/x-pn-realaudio',
		'ram': 'audio/x-pn-realaudio',
		'ras': 'image/x-cmu-raster',
		'rdf': 'application/rdf+xml',
		'rgb': 'image/x-rgb',
		'rm': 'application/vnd.rn-realmedia',
		'roff': 'application/x-troff',
		'rtf': 'text/rtf',
		'rtx': 'text/richtext',
		'sgm': 'text/sgml',
		'sgml': 'text/sgml',
		'sh': 'application/x-sh',
		'shar': 'application/x-shar',
		'silo': 'model/mesh',
		'sit': 'application/x-stuffit',
		'skd': 'application/x-koan',
		'skm': 'application/x-koan',
		'skp': 'application/x-koan',
		'skt': 'application/x-koan',
		'smi': 'application/smil',
		'smil': 'application/smil',
		'snd': 'audio/basic',
		'so': 'application/octet-stream',
		'spl': 'application/x-futuresplash',
		'src': 'application/x-wais-source',
		'sv4cpio': 'application/x-sv4cpio',
		'sv4crc': 'application/x-sv4crc',
		'svg': 'image/svg+xml',
		'swf': 'application/x-shockwave-flash',
		't': 'application/x-troff',
		'tar': 'application/x-tar',
		'tcl': 'application/x-tcl',
		'tex': 'application/x-tex',
		'texi': 'application/x-texinfo',
		'texinfo': 'application/x-texinfo',
		'tif': 'image/tiff',
		'tiff': 'image/tiff',
		'tr': 'application/x-troff',
		'tsv': 'text/tab-separated-values',
		'txt': 'text/plain',
		'ustar': 'application/x-ustar',
		'vcd': 'application/x-cdlink',
		'vrml': 'model/vrml',
		'vxml': 'application/voicexml+xml',
		'wav': 'audio/x-wav',
		'wbmp': 'image/vnd.wap.wbmp',
		'wbmxl': 'application/vnd.wap.wbxml',
		'wml': 'text/vnd.wap.wml',
		'wmlc': 'application/vnd.wap.wmlc',
		'woff': 'font/woff',
		'wmls': 'text/vnd.wap.wmlscript',
		'wmlsc': 'application/vnd.wap.wmlscriptc',
		'wrl': 'model/vrml',
		'xbm': 'image/x-xbitmap',
		'xht': 'application/xhtml+xml',
		'xhtml': 'application/xhtml+xml',
		'xls': 'application/vnd.ms-excel',
		'xml': 'application/xml',
		'xpm': 'image/x-xpixmap',
		'xsl': 'application/xml',
		'xslt': 'application/xslt+xml',
		'xul': 'application/vnd.mozilla.xul+xml',
		'xwd': 'image/x-xwindowdump',
		'xyz': 'chemical/x-xyz',
		'zip': 'application/zip'
	};

	return extension[ext.toLowerCase()] || 'application/octet-stream';
}

function CouchDB_id(doc) {

	var type = typeof(doc);

	if (type === 'string' || type === 'number')
		return doc;

	if (typeof(doc._id) !== 'undefined')
		return doc._id;

	if (doc.id !== 'undefined')
		return doc.id;

	return null;
}

function CouchDB_rev(doc) {

	var type = typeof(doc);

	if (type === 'string' || type === 'number')
		return doc;

	if (typeof(doc._rev) !== 'undefined')
		return doc._rev;

	if (doc.rev !== 'undefined')
		return doc.rev;

	return null;
}

function onResponseData_alive(chunk) {
	var self = this;
	self.couchdb_buffer += chunk.toString('utf8');
	setImmediate(function() {
		onResponseData_alive_parse(self);
	});
}

function onResponseData_alive_parse(res) {

	if (res.couchdb_parsed)
		return;

	res.couchdb_parsed = true;

	var index = res.couchdb_buffer.indexOf('\n');
	if (index === -1) {
		res.couchdb_parsed = false;
		return;
	}

	var line = res.couchdb_buffer.substring(0, index).trim();

	res.couchdb_buffer = res.couchdb_buffer.substring(index + 1);
	res.couchdb_parsed = false;
	res.couchdb_callback(null, JSON_parse(line), function() {

		if (res.couchdb_end)
			return;

		res.couchdb_end = true;
		res.removeAllListeners('data');
		res.removeAllListeners('error');
		res.couchdb_parsed = true;
		res.connection.destroy();
		res.couchdb_buffer = null;
		res.couchdb_callback = null;
		res = null;
	});

	setImmediate(function() {
		onResponseData_alive_parse(res);
	});
}

function onResponseData(chunk) {
	this.couchdb_buffer += chunk.toString('utf8');
}

function onResponseEnd() {

	var self = this;
	var buffer = self.couchdb_buffer.trim();
	var data = JSON_valid(buffer) ? JSON_parse(buffer, without) : buffer;
	var operation = self.couchdb_operation;
	var fnCallback = self.couchdb_callback;
	var without = self.couchdb_without;
	var total = 0;
	var offset = 0;

	if (self.statusCode >= 400) {
		var error = new Error(self.statusCode, (data.error || '') + ') ' + (data.reason || ''));
		fnCallback(error, null, -1, -1);
		return;
	}

	switch (operation) {
		case 'operation':
			break;
		case 'first':
			data = data.rows[0] || null;
			break;
		case 'changes':
			data = data.results;
			break;
		case 'uuids':
			data = data.uuids;
			break;
		default:

			if (!self.couchdb_raw)
				data = data.rows;

			total = data.total_rows;
			offset = data.offset;

			break;
	}

	fnCallback(null, data, total, offset);
}

function onRequestError(error) {
	var self = this;
	var fnCallback = self.couchdb_callback;
	fnCallback(error, null, -1, -1);
}

function onRequestErrorTimeout() {
	var self = this;
	var fnCallback = self.couchdb_callback;
	fnCallback(new Error(408, 'Request timeout error'), null, -1, -1);
}

/*
	Object to URL params
	@obj {Object}
	return {String}
*/
function Couchdb_params(obj) {

	if (typeof(obj) === 'undefined' || obj === null)
		return '';

	var buffer = [];
	var arr = Object.keys(obj);

	if (typeof(obj.group) !== 'undefined')
		obj.reduce = obj.group;

	if (typeof(obj.reduce) === 'undefined')
		obj.reduce = false;

	for (var i = 0, length = arr.length; i < length; i++) {

		var o = arr[i];
		var value = obj[o];
		var name = o.toLowerCase();

		switch (name) {
            case 'feed':
                buffer.push('feed=' + value.toString().toLowerCase());
                break;
            case 'heartbeat':
                buffer.push('heartbeat=' + encodeURIComponent(JSON.stringify(value)));
                break;
			case 'full':
			case 'raw':
				break;
			case 'skip':
			case 'limit':
			case 'descending':
			case 'reduce':
			case 'group':
			case 'stale':
				buffer.push(name + '=' + value.toString().toLowerCase());
				break;
			case 'group_level':
			case 'grouplevel':
			case 'level':
				buffer.push('group_level=' + value);
				break;
			case 'update_seq':
			case 'updateseq':
			case 'update':
				buffer.push('update_seq=' + value.toString().toLowerCase());
				break;
			case 'include_docs':
			case 'includedocs':
			case 'docs':
			case 'include':
				buffer.push('include_docs=' + value.toString().toLowerCase());
				break;
			case 'inclusive_end':
			case 'inclusiveend':
			case 'inclusive':
				buffer.push('inclusive_end=' + value.toString().toLowerCase());
				break;
			case 'key':
			case 'keys':
			case 'startkey':
			case 'endkey':
				buffer.push(name + '=' + encodeURIComponent(JSON.stringify(value)));
				break;
			case 'beg':
			case 'begin':
			case 'start':
				buffer.push('startkey=' + encodeURIComponent(JSON.stringify(value)));
				break;
			case 'end':
				buffer.push('endkey=' + encodeURIComponent(JSON.stringify(value)));
				break;
			default:
				buffer.push(name + '=' + encodeURIComponent(value));
				break;
		}
	}

	return '?' + buffer.join('&');
}

// ======================================================
// PROTOTYPES
// ======================================================

/*
	Internal function
	@path {String}
	@method {String}
	@data {String or Object or Array}
	@params {Object}
	@fnCallback {Function} :: function(error, object)
	@without {String Array}
	return {CouchDB}
*/
CouchDB.prototype.get = function(path, method, data, params, fnCallback, without, operation) {

	var self = this;

	if (path[0] === '/')
		path = path.substring(1);

	var uri = self.uri;
	var type = typeof(data);
	var isObject = type === 'object' || type === 'array';
	var headers = {};

	headers['Content-Type'] = isObject ? 'application/json' : 'text/plain';

	var location = '';

	if (path[0] === '#')
		location = path.substring(1);
	else
		location = uri.pathname + path;

	var options = { protocol: uri.protocol, auth: uri.auth, method: method || 'GET', hostname: uri.hostname, port: uri.port, path: location + Couchdb_params(params), agent: false, headers: headers };
	var con = options.protocol === 'https:' ? https : http;
	var req;

	if (fnCallback) {

		var response = function (res) {
			res.couchdb_operation = operation;
			res.couchdb_buffer = '';
			res.couchdb_callback = fnCallback;
			res.couchdb_raw = params ? params['full'] || params['raw'] : false;
			res.on('data', onResponseData);
			res.on('end', onResponseEnd);
		};

		req = con.request(options, response);
		req.couchdb_callback = fnCallback;
		req.couchdb_without = without;
		req.on('error', onRequestError);
		req.setTimeout(exports.timeout, onRequestErrorTimeout);

	} else
		req = con.request(options);

	if (isObject)
		req.end(JSON.stringify(data));
	else
		req.end();

	return self;
};

/*
	Internal function
	@path {String}
	@method {String}
	@data {String or Object or Array}
	@params {Object}
	@fnCallback {Function} :: function(error, object)
	@without {String Array}
	return {CouchDB}
*/
CouchDB.prototype.get_alive = function(path, method, data, params, fnCallback, without, operation) {

	var self = this;

	if (path[0] === '/')
		path = path.substring(1);

	var uri = self.uri;
	var type = typeof(data);
	var isObject = type === 'object' || type === 'array';
	var headers = {};

	headers['Content-Type'] = isObject ? 'application/json' : 'text/plain';

	var location = '';

	if (path[0] === '#')
		location = path.substring(1);
	else
		location = uri.pathname + path;

	var options = { protocol: uri.protocol, auth: uri.auth, method: method || 'GET', hostname: uri.hostname, port: uri.port, path: location + Couchdb_params(params), agent: false, headers: headers };
	var con = options.protocol === 'https:' ? https : http;
	var req;

	if (fnCallback) {

		var response = function (res) {
			res.couchdb_operation = operation;
			res.couchdb_buffer = '';
			res.couchdb_callback = fnCallback;
			res.couchdb_parsed = false;
			res.on('data', onResponseData_alive);
		};

		req = con.request(options, response);
		req.couchdb_callback = fnCallback;
		req.couchdb_without = without;
		req.on('error', onRequestError);

	} else
		req = con.request(options);

	if (isObject)
		req.end(JSON.stringify(data));
	else
		req.end();

	return self;
};

/*
	Compact a database
	@fnCallback {Function} :: function(error)
	return {CouchDB}
*/
CouchDB.prototype.compact = function(fnCallback) {
	var self = this;
	self.get('_compact', 'POST', null, null, fnCallback, null, 'operation');
	return self;
};

/*
	Read one document from view
	@namespace {String}
	@name {String}
	@key {String or Object}
	@fnCallback {Function} :: function(error, array, total, offset) {}
	@without {String Array} :: optional, without properties
	@includeDocs {Boolean} :: optional, default false
	return {CouchDB}
*/
Views.prototype.one = function(namespace, name, key, fnCallback, without, includeDocs) {
	var self = this;
	var options = { key: key, limit: 1 };

	if (typeof(without) === 'boolean') {
		var tmp = includeDocs;
		includeDocs = without;
		without = tmp;
	}

	if (includeDocs)
		options.docs = true;

	self.all(namespace, name, options, fnCallback, without, 'first');
	return self.db;
};

/*
	Get all documents
	@params {Object} :: optional
	@fnCallback {Function} :: function(error, rows, total, offset)
	@without {String Array} :: optional
	return {CouchDB}
*/
CouchDB.prototype.all = function(params, fnCallback, without) {

	if (typeof(params) === 'function') {
		without = fnCallback;
		fnCallback = params;
		params = null;
	}

	var self = this;
	self.get('_all_docs', 'GET', null, params, fnCallback, without);
	return self;
};

/*
	Get changes
	@params {Object}
	@fnCallback {Function} :: function(error, rows, total, offset)
	@without {String Array} :: optional
	return {CouchDB}
*/
CouchDB.prototype.changes = function(params, fnCallback, without) {

	if (typeof(params) === 'function') {
		without = fnCallback;
		fnCallback = params;
		params = null;
	}

	var self = this;

	if (params && params['feed'] === 'continuous')
		self.get_alive('_changes', 'GET', null, params, fnCallback, without, 'changes');
	else
		self.get('_changes', 'GET', null, params, fnCallback, without, 'changes');

	return self;
};

/*
	CouchDB command
	@fnMap {Function}
	@fnReduce {Function}
	@params {Object}
	@fnCallback {Function} :: function(error, rows, total, offset)
	@without {String Array} :: optional
	return {CouchDB}
*/
CouchDB.prototype.query = function(fnMap, fnReduce, params, fnCallback, without) {

	var obj = {
		language: 'javascript',
		map: fnMap.toString()
	};

	if (typeof(fnCallback) === 'undefined') {
		without = fnCallback;
		fnCallback = params;
		params = fnReduce;
		fnReduce = null;
	}

	if (fnReduce)
		obj.reduce = fnReduce.toString();

	var self = this;
	self.get('_temp_view', 'POST', obj, params, fnCallback, without);
	return self;
};

/*
	Insert a document
	@doc {Object}
	@fnCallback {Function} :: optional, function(error, doc)
	return {CouchDB}
*/
CouchDB.prototype.insert = function(doc, fnCallback) {
	var self = this;
	self.get('', 'POST', doc, null, fnCallback, null, 'operation');
	return self;
};

/*
	Update a document
	@doc {Object}
	@fnCallback {Function} :: optional, function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.update = function(doc, fnCallback) {

	var id = CouchDB_id(doc);
	var rev = CouchDB_rev(doc);
	var self = this;

	if (!id || !rev) {
		if (fnCallback)
			fnCallback(new Error(notvalid), null);
		return self;
	}

	self.get(id, 'PUT', doc, null, fnCallback, null, 'operation');
	return self;
};

/*
	Remove a document
	@doc {Object or String}
	@fnCallback {Function} :: optional, function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.remove = function(doc, fnCallback) {

	var id = CouchDB_id(doc);
	var rev = CouchDB_rev(doc);
	var self = this;

	if (!id || !rev) {
		if (fnCallback)
			fnCallback(new Error(notvalid), null);
		return self;
	}

	self.get(id, 'DELETE', null, { rev: rev }, fnCallback, null, 'operation');
	return self;
};

/*
	Bulk instert documents
	@arr {Object array}
	@fnCallback {Function} :: optional, function(error, rows, total, offset)
	return {CouchDB}
*/
CouchDB.prototype.bulk = function(arr, fnCallback) {
	var self = this;
	self.get('_bulk_docs', 'POST', { docs: arr }, null, fnCallback);
	return self;
};

/*
	CouchDB command
	@max {Number}
	@fnCallback {Function} :: optional function(error, object)
	return {CouchDB}
*/
CouchDB.prototype.uuids = function(max, fnCallback) {

	if (typeof(max) === 'function') {
		fnCallback = max;
		max = 10;
	}

	var self = this;
	self.get('#/_uuids?count=' + (max || 10), 'GET', null, null, fnCallback, null, 'uuids');

	return self;
};

/*
	Read all documents from view
	@namespace {String}
	@name {String}
	@params {Object} :: optional
	@fnCallback {Function} :: function(error, array, total, offset) {}
	@without {String Array} :: optional, without properties
	@operation {String} :: optional, internal
	return {CouchDB}
*/
Views.prototype.all = function(namespace, name, params, fnCallback, without, operation) {

	var self = this;

	if (typeof(params) === 'function') {
		operation = without;
		without = fnCallback;
		fnCallback = params;
		params = null;
	}

	self.db.get('_design/' + namespace + '/_view/' + name, 'GET', null, params, fnCallback, without, operation);
	return self.db;
};

/*
	Read one document from view
	@namespace {String}
	@name {String}
	@key {String}
	@fnCallback {Function} :: function(error, array, total, offset) {}
	@without {String Array} :: optional, without properties
	return {CouchDB}
*/
CouchDB.prototype.one = function(key, fnCallback) {
	var self = this;
	self.get(key, 'GET', null, null, fnCallback, null, 'operation');
	return self.db;
};

/*
	Compact views
	[fnCallback] {Function} :: optional
	return {CouchDB}
*/
Views.prototype.compact = function(fnCallback) {
	var self = this;
	self.db.get('_compact/views', 'POST', null, null, fnCallback, null, 'operation');
	return self.db;
};

/*
	Cleanup views
	[fnCallback] {Function} :: optional
	return {CouchDB}
*/
Views.prototype.cleanup = function(fnCallback) {
	var self = this;
	self.db.get('_view_cleanup', 'POST', null, null, fnCallback, null, 'operation');
	return self.db;
};

 /*
	CouchDB command
	@doc {Object} :: object with properties: _id and _rev
	@filename {String/Stream/Buffer}
	@filesave {String} :: optional
	@fnCallback {Function} :: optional function(error, object)
	return {CouchDB}
*/
Attachment.prototype.insert = function(doc, filename, filesave, fnCallback) {

	var id = CouchDB_id(doc);
	var rev = CouchDB_rev(doc);
	var self = this;
	var type = 0;

	if (typeof(filename.pipe) !== 'undefined')
		type = 1; // stream
	else if (typeof(filename.write) !== 'undefined')
		tpye = 2; // buffer

	if (typeof(filesave) === 'function') {
		fnCallback = filesave;
		filesave = path.basename(filename);
	}

	if (!id || !rev) {

		if (fnCallback)
			fnCallback(new Error(notvalid), null);

		return self.db;
	}

	var uri = self.db.uri;
	var name = path.basename(filesave);
	var extension = path.extname(filesave);
	var headers = {};

	headers['Cache-Control'] = 'max-age=0';
	headers['Content-Type'] = CouchDB_extension(extension);
	headers['Host'] = uri.host;
	headers['Referer'] = uri.protocol + '//' + uri.host + uri.pathname + id;

	var options = { protocol: uri.protocol, auth: uri.auth, method: 'PUT', hostname: uri.hostname, port: uri.port, path: uri.pathname + id + '/' + name + '?rev=' + rev, agent: false, headers: headers };
	var connection = options.protocol === 'https:' ? https : http;
	var req;

	if (fnCallback) {

		var response = function (res) {

			res.couchdb_operation = 'operation';
			res.couchdb_buffer = '';
			res.couchdb_callback = fnCallback;

			res.on('data', onResponseData);
			res.on('end', onResponseEnd);
		};

		req = connection.request(options, response);
		req.couchdb_callback = fnCallback;
		req.couchdb_without = null;
		req.on('error', onRequestError);
		req.setTimeout(exports.timeout, onRequestErrorTimeout);

	} else
		req = connection.request(options);

	if (type === 0)
		fs.createReadStream(filename).pipe(req);
	else if (type === 1)
		filename.pipe(req);
	else if (type === 2) {
		req.write(filename, 'binary');
		req.end();
	}

	return self.db;
};

Attachment.prototype.upload = function(doc, filename, filesave, fnCallback) {
	return this.insert(doc, filename, filesave, fnCallback);
};

/*
	Remove an attachment from document
	@doc {Object} :: valid CouchDB document with _id and _rev
	@filename {String}
	@fnCallback {Function} :: optional
*/
Attachment.prototype.remove = function(doc, filename, fnCallback) {

	var id = CouchDB_id(doc);
	var rev = CouchDB_rev(doc);
	var self = this;

	if (!id || !rev) {

		if (fnCallback)
			fnCallback(new Error(notvalid), null);

		return self.db;
	}

	self.db.get(doc._id + '/' + filename, 'DELETE', null, { rev: doc._rev }, fnCallback, null, 'operation');
	return self.db;
};

/*
	Download ant attachment
	@doc {Object or String} :: doc or document ID
	@filename {String}
	@response {HttpResponse or Function} :: if function(res, contentType)
	return {CouchDB}
*/
Attachment.prototype.download = function(doc, filename, response) {

	var id = CouchDB_id(doc);
	var self = this;

	if (!id)
		throw new Error(notvalid);

	var uri = self.db.uri;
	var options = { protocol: uri.protocol, auth: uri.auth, hostname: uri.hostname, port: uri.port, path: uri.pathname + id + '/' + filename, agent: false };
	var connection = options.protocol === 'https:' ? https : http;

    connection.get(options, function(res) {

		if (typeof(response) === 'function') {
			response(res, res.headers['content-type']);
			return;
		}

		if (response.res)
			response = response.res;

		if (response.writeHead) {
			response.success = true;
			response.writeHead(200, { 'Content-Type': res.headers['content-type'] });
		}

		res.pipe(response);
    });

    return self.db;
};

// ======================================================
// EXPORTS
// ======================================================

exports.timeout = 10000;
exports.CouchDB = CouchDB;

/*
	CouchDB class
	@connectionString {String} :: url address
*/
exports.init = function(connectionString) {
	return new CouchDB(connectionString);
};

exports.load = function(connectionString) {
	return new CouchDB(connectionString);
};