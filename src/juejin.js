const sendMail = require("./utils/sendMail");
const JuejinHelper = require("juejin-helper");

let [cookie, user, pass, to] = process.argv.slice(2);
process.env.user = user;
process.env.pass = pass;

function addHtmlText (name, value) {
	return `<p style="text-indent: 2em">${name}: ${value}</p><br/>`
}

async function run() {

	let html = '<h1 style="text-align: center">掘金自动化通知</h1>'
	const juejin = new JuejinHelper();
	await juejin.login(cookie);

	const growth = juejin.growth();

	// 获取今日签到状态
	const res3 = await growth.getTodayStatus();

	async function checkIn() {
		try {
			const res = await growth.checkIn();
			html += addHtmlText('签到:', `签到成功！获得${res.incr_point}矿石，现有${res.sum_point}矿石`)
		} catch (e) {
			console.log('e:', e.message)
				await checkIn()
		}
	}

	if (res3) {
		html += addHtmlText('是否签到', '已经签到')
	} else {
		// 签到
		await checkIn()
	}


	// 获取当前矿石数
	const res1 = await growth.getCurrentPoint();
	html += addHtmlText('当前矿石数', res1)

	// 获取统计签到天数
	const res2 = await growth.getCounts();
	html += addHtmlText('统计签到天数', res2.cont_count)

	// 获取抽奖配置
	// const res4 = await growth.getLotteryConfig();

	// 抽奖
	const res5 = await growth.drawLottery();
	html += addHtmlText('抽奖', res5.lottery_name)

	// 获取我的幸运值
	const res6 = await growth.getMyLucky();
	html += addHtmlText('幸运值', res6.total_value)

	await juejin.logout();
	return sendMail({
		from: "掘金",
		to,
		subject: "定时任务成功",
		html,
	}).catch(console.error);
}
run().then(r => r);

