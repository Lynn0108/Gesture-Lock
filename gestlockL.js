window.onload = function () {
	var p_arr = [],    //存放绘制的9个点
		pre_po = [],   //存放设置的密码点
		rest_arr = []; //存放剩下的点
	var r = 20;        //圆半径
	var step;          //1-第二次设置密码，else-第一次设置密码
	var startFlag = false;
	var gesLock = document.getElementById('gesLock');
	// var verps = document.getElementById('verps'),
	//     setps = document.getElementById('setps');
	if (gesLock.getContext) {
		var ctx = gesLock.getContext("2d");
		p_arr = drawCircle(ctx); //绘制圆并获取9个点的坐标
		rest_arr = p_arr;
	}
	gesLock.addEventListener("touchstart", function (e) {
		var c_po = getCurPo(e);
		//pre_po = [];
		//console.log(c_po);
		for (var i = 0; i < p_arr.length; i++) {
			if (Math.abs(c_po.x - p_arr[i].x) < r && Math.abs(c_po.y - p_arr[i].y) < r){
				selectedNode(ctx, p_arr[i], r);
				pre_po.push(p_arr[i]);
				rest_arr.splice(i, 1);
				startFlag = true;
				break;
			}
		}
	}, false);
	gesLock.addEventListener("touchmove", function (e) {
		e.preventDefault();
		if (startFlag) {
			//重新绘制画布
			ctx.clearRect(0, 0, gesLock.width, gesLock.height);
			p_arr = drawCircle(ctx);
			//将之前已经选过点填充
			for (var i = 0; i < pre_po.length; i++) {
				selectedNode(ctx, pre_po[i], r);
			}
			c_po = getCurPo(e);
			//console.log(c_po);
			//绘制轨迹
			ctx.strokeStyle = '#FF5A66';
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.moveTo(pre_po[0].x, pre_po[0].y);
			for (var i = 1; i < pre_po.length; i++) {
				//ctx.moveTo(pre_po[i-1].x, pre_po[i-1].y);
				ctx.lineTo(pre_po[i].x, pre_po[i].y);
			}
			ctx.lineTo(c_po.x, c_po.y);
			ctx.stroke();
			ctx.closePath();

			for (var i = 0; i < rest_arr.length; i++) {
				var ra_p = rest_arr[i];
				if (Math.abs(c_po.x - ra_p.x) < r && Math.abs(c_po.y - ra_p.y) < r) {
					selectedNode(ctx, ra_p, r);
					pre_po.push(ra_p);
					rest_arr.splice(i, 1);
					break;
				}
			}
		}
	},false);
	gesLock.addEventListener("touchend", function (e) {
		if (startFlag) {
			startFlag = false;
			var sp = saveGest(pre_po, step);
			step = sp;
			setTimeout(function () {
				//重置面板
				ctx.clearRect(0, 0, gesLock.width, gesLock.height);
				pre_po = [];
				p_arr = drawCircle(ctx);
				rest_arr = p_arr;
			}, 400);
		}
	}, false);
}
function drawCircle(context) {//绘制圆圈并返回位置坐标
	var r = 20;
	var arr = [],
		count = 0;
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			count ++;
			var p_obj = {
				x: (2 * j + 1) * r + 45 * (j + 1),
				y: (2 * i + 1) * r + 45 * (i + 1),
				index: count
			};
			arr.push(p_obj);
			//rest_arr.push(p_obj);
			context.strokeStyle = '#D3D3D3';
			context.fillStyle = '#FFF';
			context.lineWidth = 2;
			context.beginPath();
			context.arc(p_obj.x, p_obj.y, r, 0, 2 * Math.PI, false);
			context.closePath();
			context.stroke();
			context.fill();
		}
	}
	return arr;
}
function getCurPo(e) { //返回触摸点在画布中的坐标位置
	var rect = e.currentTarget.getBoundingClientRect();
	var position = {
		x: e.touches[0].clientX - rect.left,
		y: e.touches[0].clientY - rect.top
	};
	return position;
}
function selectedNode(ctx, s_po, r) {//填充选中点
	ctx.fillStyle = "#FFA726";
	ctx.beginPath();
	ctx.arc(s_po.x, s_po.y, r, 0, 2 * Math.PI, false);
	ctx.closePath();
	ctx.fill();
}
function checkpsw(prepsw,nowpsw) { //判断密码是否一致
	for (var i = 0; i < prepsw.length; i++) {
		if (prepsw[i].index !== nowpsw[i].index) {
			return false;
		}
	}
	return true;
}
function saveGest(psw, step) { //判断是否保存密码，判断是否解锁成功
	//var step;
	var tip = document.getElementById('tip');
	var verps = document.getElementById('verps'),
	    setps = document.getElementById('setps');
	if (setps.checked) {
		if (step == 1) {//两次输入
			prepsw = JSON.parse(window.localStorage.getItem('password'));
			if (checkpsw(prepsw, psw)) {
				tip.innerHTML = '密码设置成功';
			}else {
				tip.innerHTML = '两次输入的不一致';
				window.localStorage.removeItem('password');
			}
			step = 0;
		} else {
			if (psw.length < 5) {
				tip.innerHTML = '密码太短，至少需要5个点';
				setTimeout(function () {
					tip.innerHTML = '请输入手势密码';
				}, 2000);
			} else {
				step = 1;
				window.localStorage.setItem('password', JSON.stringify(psw));
				tip.innerHTML = '请再次输入手势密码';
			}
		}
	} else if (verps.checked) {
		svpsw = JSON.parse(window.localStorage.getItem('password'));
		if (!svpsw) {
			tip.innerHTML = '您还没有设置过密码，请先设置密码';
			setTimeout(function () {
					tip.innerHTML = '请输入手势密码';
			}, 2000);
			return 0;
		}
		if (checkpsw(svpsw, psw)) {
			tip.innerHTML = '密码正确';
		} else {
			tip.innerHTML = '输入的密码不正确';
		}
	}
	return step;
}
