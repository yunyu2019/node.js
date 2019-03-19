var fs=require('fs');
function Transfer(req, res) {
	this.req = req;
	this.res = res;
}

Transfer.prototype._calStartPosition = function(Range) {
	var startPos = 0;
	if(typeof(Range) != 'undefined') {
		var startPosMatch = /^bytes=([0-9]+)-$/.exec(Range);
		startPos = Number(startPosMatch[1]);
	}
	return startPos;
};

Transfer.prototype._configHeader = function(Config) {
	var startPos = Config.startPos, fileSize = Config.fileSize,res = this.res;
	res.setHeader('Content-Length',fileSize);
	// 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
	if(startPos == 0) {
		res.setHeader('Accept-Range', 'bytes');
	} else {
		res.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
	}
};

Transfer.prototype._init = function(filePath, down) {
	var config = {};
	var self = this;
	fs.stat(filePath, function(error, state) {
		if(error)
			throw error;

		config.fileSize = state.size;
		var range = self.req.headers.range;
		config.startPos = self._calStartPosition(range);
		self.config = config;
		self._configHeader(config);
		down();
	});
};

/**
 * [@description](/user/description) 生成大文件文档流，并发送
 * [@param](/user/param) {string} filePath 文件地址
 */
Transfer.prototype.Download = function(filePath,dst_name) {
	var self = this;
	self._init(filePath, function() {
		var config = self.config,res = self.res;
		fReadStream = fs.createReadStream(filePath, {
			encoding : 'binary',
			bufferSize : 1024 * 1024,
			start : config.startPos,
			end : config.fileSize
		});
		fReadStream.on('data', function(chunk) {
			res.write(chunk, 'binary');
		});
		fReadStream.on('end', function() {
			res.end();
		});
	});	
};
module.exports=Transfer