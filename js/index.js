$(function(){

	  $('#search_button').button({
       icons : {
            primary : 'ui-icon-search',
          },
    });
     $('#question_button').button({
       icons : {
            primary : 'ui-icon-lightbulb',
          },
    }).click(function(){

      if($.cookie('user')){
         $('#question').dialog('open');
      }else{

        $('#error').dialog('open');
        setTimeout(function(){
           $('#error').dialog('close');
           $('#login').dialog('open');
        
        },1000);

      }
    });
     
     $('#error').dialog({
      autoOpen : false,
      modal : true,//幕布
      closeOnEscape : false,
      resizable : false,
      draggable : false,
      width :  180,
      height : 50,
     }).parent().find('.ui-widget-header').hide();
   $.ajax({
    url : 'show_content.php',
    type : 'POST',
    success : function(response,status,xhr){
     //alert(response);
     var json=  $.parseJSON(response);
     var html='';
     var arr=[];
     $.each(json,function(index,value){
      //alert(value.title);
      html += '<h4>'+value.user+'发表于'+value.date+'</h4><h3>'+value.title+'</h3><div class="editor">'+value.content+'</div><div class="bottom"><span class="comment" data-id="'+value.id+'">'+value.count+'条评论</span><span class="up">收起</span><span class="down">显示全部</span><hr noshade="noshade"  size="1" /><div class="comment_list"></div>'
     
     });
     $('.content').append(html);
     $.each($('.editor'),function(index,value){
        arr[index] = $(value).height();
        if($(value).height()>150){
          $(value).next('.bottom').find('.up').hide();
        }
        $(value).height(150);

     });
     $.each($('.bottom .down'),function(index,value){
       $(this).click(function(){
          $(this).parent().prev().height(arr[index]);
          $(this).hide();
          $(this).parent().find('.up').show();
       });
     });
     $.each($('.bottom .up'),function(index,value){
       $(this).click(function(){
          $(this).parent().prev().height(150);
          $(this).hide();
          $(this).parent().find('.down').show();
       });
     });
     $.each($('.bottom'),function(index,value){
       $(this).on('click','.comment',function(){
        var comment_this=this;
        if($.cookie('user')){
          if(!$('.comment_list').eq(index).has('form').length){
            
            $.ajax({
              url : 'show_comment.php',
              type : 'POST',
              data : {
                 titleid : $(comment_this).attr('data-id'),
              },
              beforeSend : function(jqXHR,settings){
               $('.comment_list').eq(index).append('<dl class="comment_load"><dd>正在加载评论</dd></dl>');
              },
              success : function(response,status){
                 $('.comment_list').eq(index).find('.comment_load').hide();
                 var json_comment=  $.parseJSON(response);
                 var count =0; 
                 $.each(json_comment,function(index2,value){
                    count = value.count;
                    $('.comment_list').eq(index).append('<dl class="comment_content"><dt>'+value.user+'</dt><dd>'+value.comment+'</dd><dd class="date">'+value.date+'</dd></dl>');
                  });
                 $('.comment_list').eq(index).append('<dl><dd><span class="load_more">加载更多评论</span></dd></dl>');
                 var page =2; 
                 if(page > count){
                    $('.comment_list').eq(index).find('.load_more').off('click');
                    //也可隐藏
                    $('.comment_list').eq(index).find('.load_more').hide();
                  }
                 
                 $('.comment_list').eq(index).find('.load_more').button().on('click',function(){
                    $('.comment_list').eq(index).find('.load_more').button('disable');
                    $.ajax({
                      url : 'show_comment.php',
                      type : 'POST',
                      data : {
                        titleid : $(comment_this).attr('data-id'),
                        page : page,
                      },
                      
                      success : function(response,status){
                        var json_comment_more=  $.parseJSON(response);
                        $.each(json_comment_more,function(index3,value){
                           $('.comment_list').eq(index).find('.comment_content').last().after('<dl class="comment_content"><dt>'+value.user+'</dt><dd>'+value.comment+'</dd><dd class="date">'+value.date+'</dd></dl>');
                        });
                        $('.comment_list').eq(index).find('.load_more').button('enable');
                        page++;
                        if(page > count){
                          $('.comment_list').eq(index).find('.load_more').off('click');
                          //也可隐藏
                          $('.comment_list').eq(index).find('.load_more').hide();
                        }
                      }
                    });
                 });

                 $('.comment_list').eq(index).append('<form><dl class="comment_add"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="'+$(comment_this).attr('data-id')+'"/><input type="hidden" name="user" value="'+$.cookie('user')+'"/><input type="button" value="发表"/></dd></dl></form>');
                 $('.comment_list').eq(index).find('input[type=button]').button().click(function(){
                 var _this=this;
                 $('.comment_list').eq(index).find('form').ajaxSubmit({
                  url : 'add_comment.php',
                  type : 'POST',
                  beforeSubmit : function(){
                       $('#loading').dialog('open');
                       $(_this).button('disable');
                    },
                  success : function(responseText,statusText){
                     if(responseText){
                    
                       $(_this).button('enable');
                       $('#loading').css('background','url(image/right.png) no-repeat 30px center').html('数据新增成功');
                       setTimeout(function(){
                        var date = new Date();
                        $('#loading').dialog('close');
                        $('.comment_list').eq(index).prepend('<dl class="comment_content"><dt>'+$.cookie('user')+'</dt><dd>'+$('.comment_list').eq(index).find('textarea').val()+'</dd><dd class="date">'+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'</dd></dl>');

                        $('.comment_list').eq(index).find('form').resetForm();
                        $('#loading').css({
                            'background' : 'url(image/loading.gif) no-repeat 20px center',
                            'background-size' : '45px 45px'
                        }).html('数据交互中。。');
                       },1000);
                     }
                  }
                 });
                });
              },
            });
          }
          
          if($('.comment_list').eq(index).is(':hidden')){
             $('.comment_list').eq(index).show();
           }else{
             $('.comment_list').eq(index).hide();
           }
         
        
        }else{
           $('#error').dialog('open');
           setTimeout(function(){
           $('#error').dialog('close');
           $('#login').dialog('open');
        
        },1000);

        }
       });

     });
    },  
   });

   $('#question').dialog({
        autoOpen : false,
        modal : true,
        width : 500,
        height : 360,
        resizable : false, 
        buttons : {
          '提交' : function(){
            $(this).ajaxSubmit({
              url : 'add_content.php',
              type : 'POST',
              data : {
                user : $.cookie('user')
              },
              beforeSubmit : function(){
                 $('#loading').dialog('open');
                 $('#question').dialog('widget').find('button').eq(1).button('disable');
              },
              success : function(responseText,statusText){
                 if(responseText){
                
                   $('#question').dialog('widget').find('button').eq(1).button('enable');
                   $('#loading').css('background','url(image/right.png) no-repeat 30px center').html('数据新增成功');
                   setTimeout(function(){
                    $('#loading').dialog('close');
                    $('#question').dialog('close');
                    $('#question').resetForm();
                    $('#loading').css({
                        'background' : 'url(image/loading.gif) no-repeat 20px center',
                        'background-size' : '45px 45px'
                    }).html('数据交互中。。');
                   },1000);
                 }
              }

            });
          }
        }
    });
 $('#member,#logout').hide();
   if($.cookie('user')){
       $('#member,#logout').show();
       $('#reg_a,#login_a').hide();
       $('#member').html($.cookie('user'));
   }else{
       $('#member,#logout').hide();
       $('#reg_a,#login_a').show();
   }
   $('#logout').click(function(){
      $.removeCookie('user');
     window.location.reload();
      // $('#member,#logout').hide();
      //  $('#reg_a,#login_a').show();
   });


    $('#loading').dialog({
      autoOpen : false,
      modal : true,//幕布
      closeOnEscape : false,
      resizable : false,
      draggable : false,
      width :  180,
      height : 50,


    }).parent().find('.ui-widget-header').hide();

	  $('#reg_a').click(function(){
      $('#reg').dialog('open');
    });
    $('#reg').dialog({
        autoOpen : false,
        modal : true,
        width : 320,
        height : 340,
        resizable : false, 
    	  buttons : {
          '提交' : function(){
            $(this).submit();
          }
        }
    }).buttonset().validate({
      submitHandler : function(form){
            $(form).ajaxSubmit({
              url : 'add.php',
              type : 'POST',
              beforeSubmit : function(){
                 $('#loading').dialog('open');
                 $('#reg').dialog('widget').find('button').eq(1).button('disable');
              },
              success : function(responseText,statusText){
                 if(responseText){
                   $('#reg').dialog('widget').find('button').eq(1).button('enable');
                   $('#loading').css('background','url(image/right.png) no-repeat 30px center').html('数据新增成功');
                   $.cookie('user',$('#user').val());
                   setTimeout(function(){
                    $('#loading').dialog('close');
                    $('#reg').dialog('close');
                    $('#reg').resetForm();
                    $('#reg span.star').html('*').removeClass('succ');
                    $('#loading').css({
                        'background' : 'url(image/loading.gif) no-repeat 20px center',
                        'background-size' : '45px 45px'
                    }).html('数据交互中。。');
                    $('#member,#logout').show();
                    $('#reg_a,#login_a').hide();
                    $('#member').html($.cookie('user'));
                   },1000);
                 }
              },
            });

      },
      showErrors : function(errorMap,errorList){
        var errors = this.numberOfInvalids();
        if(errors > 0){
          $('#reg').dialog('option','height',errors*15+340);
         }else{
          $('#reg').dialog('option','height',340);
         }
        this.defaultShowErrors();
      },
      //出错时
      highlight : function(element,errorClass){
         $(element).css('border','1px solid #630');//element得到是span
         $(element).next().html('*').removeClass('succ');

         
      },
      //错误解决时
      unhighlight : function(element,errorClass){
         $(element).css('border','1px solid #ccc');
         $(element).next().html('&nbsp;').addClass('succ');
      },
      errorLabelContainer : 'ol.error',
      wrapper : 'li',
      
      rules : {
        user : {
          required : true,
          minlength : 2,
          remote : {
            url : 'is_user.php',
            type : 'POST',
          },
        },
        pass : {
          required : true,
          minlength : 6,
        },
        email : {
          required : true,
          email : true, 
        }
      },
      messages : {
        user : {
          required : '此为必填字段',
          minlength : '不得少于{0}位',
          remote : '账号被占用!',
        },
        pass : {
          required : '密码不得为空',
          minlength : '密码不得少于{0}位',
        },
        email : {
          required : '邮箱不得为空',
          email : '请输入正确的邮箱',
        }
      }
    });
    $('#reg').parent().css('top','150px');
   
    $('#date').datepicker({
     
      changeMonth : true,//月份的下拉框
      changeYear : true,//年份的下拉框
      yearSuffix : '',
      maxDate : 0,
      yearRange : '1950:2020',
      

    });
    $('#email').autocomplete({
         dalay :0,
         autoFocus : true,
         source : function(request,response){
            var hosts = ['qq.com','163.com','263.com','sina.com.cn','gmail.com','hotmail.com'],
                term = request.term,  //获取用户内容
                name=term,     //邮箱的用户名
                host = '',     //邮箱的域名
                ix = term.indexOf('@'),//@的位置
                result = [];     //邮箱的呈现列表

            result.push(term);

            if(ix>-1){
              
              name = term.slice('0',ix);
              host = term.slice(ix+1);
            }
           
            if(name){
            var findedHosts = (host?findedHosts = $.grep(hosts,function(value,index){
                        return value.indexOf(host)>-1;
                  }):hosts),findedResult = $.map(findedHosts,function(value,index){
                  return name +'@'+value;
              });
               
              result = result.concat(findedResult);

            } 
           response(result);
         }
      });
   
    $('#login_a').click(function(){
      $('#login').dialog('open');
    });
   
    $('#login').dialog({
        autoOpen : false,
        modal : true,
        width : 320,
        height : 240,
        resizable : false, 
        buttons : {
          '提交' : function(){
            $(this).submit();
          }
        }
    }).validate({
      submitHandler : function(form){
            $(form).ajaxSubmit({
              url : 'login.php',
              type : 'POST',
              beforeSubmit : function(){
                 $('#loading').dialog('open');
                 $('#login').dialog('widget').find('button').eq(1).button('disable');
              },
              success : function(responseText,statusText){
                // window.location.reload();
                 if(responseText){
                   $('#login').dialog('widget').find('button').eq(1).button('enable');
                   $('#loading').css('background','url(image/right.png) no-repeat 30px center').html('登录成功');
                   $.cookie('user',$('#login_user').val());
                   setTimeout(function(){
                    $('#loading').dialog('close');
                    $('#login').dialog('close');
                    $('#member,#logout').show();
                    $('#reg_a,#login_a').hide();
                    $('#member').html($.cookie('user'));
                   },1000);
                 }
              },
            });

      },
      showErrors : function(errorMap,errorList){
        var errors = this.numberOfInvalids();
        if(errors > 0){
          $('#login').dialog('option','height',errors*15+240);
         }else{
          $('#login').dialog('option','height',240);
         }
        this.defaultShowErrors();
      },
      //出错时
      highlight : function(element,errorClass){
         $(element).css('border','1px solid #630');//element得到是span
         $(element).next().html('*').removeClass('succ');

         
      },
      //错误解决时
      unhighlight : function(element,errorClass){
         $(element).css('border','1px solid #ccc');
         $(element).next().html('&nbsp;').addClass('succ');
      },
      errorLabelContainer : 'ol.login_error',
      wrapper : 'li',
      
      rules : {
        login_user : {
          required : true,
          minlength : 2,
          
        },
        login_pass : {
          required : true,
          minlength : 6,
          remote : {
            url : 'login.php',
            type : 'POST',
            data : {
              user : function(){
                return $('#login_user').val();
              },
            },
          },
        },
        
      },
      messages : {
        login_user : {
          required : '此为必填字段',
          minlength : '不得少于{0}位',
          
        },
        login_pass : {
          required : '密码不得为空',
          minlength : '密码不得少于{0}位',
          remote : '账号或密码不正确！',
        },
        
      }
    });
   
$('#tabs').tabs();

$('#accordion').accordion({
  //collapsible : true,//自我关闭
  // disable : true,
  // event : 'mouseover',
  //active : true,//默认关闭 
  // heightStyle : 'auto',
  // heightStyle : 'content' ,//适应文本
  // heightStyle : 'fill'
  //header: 'h1',//不对应会出错
  icons : {
    "header" : "ui-icon-plus",
    "activeHeader" : "ui-icon-minus"
  },

  // create : function(event,ui){
  //   //alert('create');
  //   alert($(ui.header.get()).html());
  //   alert($(ui.panel.get()).html());

  // },

  // activate : function(event,ui){
  //  //alert('切换的时候');
  //   alert($(ui.newHeader.get()).html());
  //   alert($(ui.newPanel.get()).html());
  //   alert($(ui.oldHeader.get()).html());
  //   alert($(ui.oldPanel.get()).html());

  // },

  // beforeActivate : function(event,ui){
  //   alert($(ui.newHeader.get()).html());
  //   alert($(ui.newPanel.get()).html());
  //   alert($(ui.oldHeader.get()).html());
  //   alert($(ui.oldPanel.get()).html());
  // } ,
});

//$('#accordion').accordion('disable');//不能想选项卡一样禁用某个
//$('#accordion').accordion('option','active',1);//设置默认
// $('#accordion').on('accordionactivate',function(event,ui){
//     alert($(ui.newHeader.get()).html());
//     alert($(ui.newPanel.get()).html());
//     alert($(ui.oldHeader.get()).html());
//     alert($(ui.oldPanel.get()).html());

// });
});