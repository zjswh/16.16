<?php
	require 'config.php';
    
	$_pass =sha1($_POST['login_pass']);//加密
	$_user =$_POST['user'];
    
	$query = mysql_query("SELECT user ,pass FROM user WHERE 
		user='{$_user}' AND pass='{$_pass}'") or die('SQL错误！');
	if(mysql_fetch_array($query,MYSQL_ASSOC)){//如果存在
		echo 'true';
	}else{
		echo 'false';
	}
	
	mysql_close();

?>