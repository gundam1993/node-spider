var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');

var queryHref = "http://www.haha.mx/topic/1/new/";
var querySearch = 1;
var urls = [];

var sumCount = 0; //总数
var reptCount = 0; // 重复
var downCount = 0; //实际下载


/**
 * 根据url和参数获取分页内容
 * @param {string}: url
 * @param {int}: search
 */
function getHtml(href, search) {
  console.log(`正在获取第${search}页的图片`);
  var pageData = "";
  var req = http.get(href + search, function (res) {
    res.setEncoding('utf8');
    res.on('data',function (chunk) {
      pageData += chunk;
    });

    res.on('end', function () {
      $ = cheerio.load(pageData);
      var html = $('.joke-list-item .joke-main-content a img');
      for (var i = 0; i < html.length; i++) {
        var src = html[i].attribs.src;
        if (src.indexOf("http://image.haha.mx") > -1) {
          urls.push(html[i].attribs.src);
        }
      }
      //递归调用
      if (search < pagemax) {
        getHtml(href, ++search);
      }else{
        console.log('图片链接获取完毕！');
        sumCount = urls.length;
        console.log(`链接总数：${urls.length}`);
        console.log('开始下载...');
        downImg(urls.shift());
      }
    });
  });
}

/**
 * 下载图片
 * @param {String} imgurl:图片地址
 */
function downImg(imgurl) {
  console.log(imgurl);
  var narr = imgurl.replace('http://image.haha.mx', '').split("/");
  var filename = "./upload/topic1/" + narr[1] + narr[2] + narr[3] + "_" + narr[5];

  fs.exists(filename, function (b) {
    if (!b) {
      http.get(imgurl.replace('/small/',"/big/"), function (res) {
        var imgData = "";
        //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.setEncoding("binary");

        res.on("data", function (chunk) {
          imgData += chunk;
        });

        res.on("end", function () {
          var savePath = "./upload/topic1/" + narr[1] + narr[2] + narr[3] + "_" + narr[5];
          //保存图片
          fs.writeFile(savePath, imgData, "binary", function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log(narr[1] + narr[2] + narr[3] + "_" + narr[5]);
              if (urls.length > 0) {
                downImg(urls.shift());
                downCount++;
                console.log(`剩余图片数量${sumCount - downCount - reptCount}`);
              }
            }
          });
        });
      });
    } else {
      console.log("该图片已存在");
      reptCount++;
      if (urls.length > 0) {
        downImg(urls.shift());
      }
    }
  });
  if (urls.length <= 0) {
    console.log("下载完毕");
    console.log(`重复图片${reptCount}`);
    console.log(`实际下载${downCount}`);
  }
  
}

var pagemax = 10;   // 获取到多少页的内容
var startindex = 1;   // 从多少页开始获取


function start() {
  console.log("开始获取图片链接");
  getHtml(queryHref,startindex);
}

start();