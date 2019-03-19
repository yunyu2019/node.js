//初始化分页
var $pagination = function(maxPage){
    var nowPage = 1;
    var pageNum='',pageList;
    if(maxPage >= 5){
        pageList = "<li><a class='pre' href='#'>&laquo;</a></li>"+
            "<li><a class='pageNum' href='#'>1</a></li>"+
            "<li><a class='pageNum' href='#'>2</a></li>"+
            "<li><a class='pageNum' href='#'>3</a></li>"+
            "<li><a class='pageNum' href='#'>4</a></li>"+
            "<li><a class='pageNum' href='#'>5</a></li>"+
            "<li><a class='next' href='#'>&raquo;</a></li>";
        $('.page .pagination').append(pageList);
        $('.page .pagination li').removeClass('active').eq(nowPage).addClass('active');
    }else{
        for(var i = 1; i <= maxPage; i++){
            pageNum += "<li><a class='pageNum' href='#'>"+i+"</a></li>"
        }
        pageList = "<li><a class='pre'  href='#'>&laquo;</a></li>"+pageNum+"<li><a class='next'  href='#'>&raquo;</a></li>";
        $('.page .pagination').append(pageList);
        $('.page .pagination li').removeClass('active').eq(nowPage).addClass('active');
    }
};

var $addPage = function(){
    //分页
    //后退
    $(document).on('click','.page .pre',function(){
        flag =false;
        var activePosition = $(this).parents('.pagination').children('.active').index();
        if(nowPage <= maxPage && maxPage && activePosition>1){
            nowPage--;
            request(thisPageUrl,nowPage);
            //改变active的位置
            $(this).parents('ul').children().eq(activePosition).removeClass('active');
            $(this).parents('ul').children().eq(activePosition-1).addClass('active');
        }else if(nowPage>5&&nowPage<maxPage&&activePosition>1){
            nowPage--;
            request(thisPageUrl,nowPage);
            //改变active的位置
            $(this).parents('ul').children().eq(activePosition).removeClass('active');
            $(this).parents('ul').children().eq(activePosition-1).addClass('active');

            var index = $(this).parents('ul').children('.active').index();
            for(var i=1;i<=5;i++){
                $('.page .pagination a').eq(i).html(nowPage-(5-i));
            }
        }else if(nowPage >1 && nowPage<maxPage && activePosition==1){
            nowPage--;
            request(thisPageUrl,nowPage);

            var index = $(this).parents('ul').children('.active').index();
            for(var i=1;i<=5;i++){
                $('.page .pagination a').eq(i).html(nowPage+i-1);
            }
        }
    });
    //前进
    $(document).on('click','.page .next',function(){
        flag =false;
        var activePosition = $(this).parents('.pagination').children('.active').index();
        if(nowPage < maxPage  && activePosition < maxPage && activePosition < 5){
            nowPage++;
            request(thisPageUrl,nowPage);
            //改变active的位置
            $(this).parents('ul').children().eq(activePosition).removeClass('active');
            $(this).parents('ul').children().eq(activePosition+1).addClass('active');
        }else if(nowPage>=5&&nowPage<maxPage && activePosition==5){
            nowPage++;
            request(thisPageUrl,nowPage);
            var index = $(this).parents('ul').children('.active').index();
            for(var i=1;i<=5;i++){
                $('.page .pagination a').eq(i).html(nowPage-(5-i));
            }
        }
    });

    //调到点击页
    $(document).on('click','.page .pagination .pageNum',function(){
        flag =false;
        nowPage = $(this).html();
        var activePosition = $(this).parents('.pagination').children('.active').index(),clickNum=$(this).html();
        if(activePosition == Number(clickNum)){
            return;
        }else{
            request(thisPageUrl,clickNum);
            $(this).parents('ul').children().eq(activePosition).removeClass('active');
            $(this).parents('ul').children().eq($(this).parent().index()).addClass('active');
        }
    })
}