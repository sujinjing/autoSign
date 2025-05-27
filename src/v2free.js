const sendMail = require("./utils/sendMail");
const requestFetch = require("./utils/utils");
const v2freeData = {
	title: 'v2free', // 标题
	h1: '自动签到', // h1标题
	notice: '通知',
	status: '', // 状态 成功 or 失败
	msg: '', // eg: "获得了 495MB 流量."
	traffic: '', // "3.29GB"
	trafficInfo: { // lastUsedTraffic: "142.77MB"  todayUsedTraffic: "0B" unUsedTraffic: "3.16GB"
		lastUsedTraffic: '',
		todayUsedTraffic: '',
		unUsedTraffic: ''
	},
	unflowtraffic: '', // nflowtraffic: 3537895424
	set ret(value) {
		if (value === 1) {
			this.status = '成功'
		} else {
			this.status = '失败'
		}
	},
	get ret() {
		return this.status
	}
}
let [cookie, user, pass, to] = process.argv.slice(2);
process.env.user = user;
process.env.pass = pass;
const headers = {
	"content-type": "application/json; charset=utf-8",
	accept: "application/json, text/javascript, */*; q=0.01",
	Cookie: cookie,
};


/**
 *
 * @param {string} cookie
 * @return {{}}
 */
function compileCookie(cookie) {
	const obj = {}
	try {
		cookie.split(';').forEach(item => {
			item = item.split('=');
			obj[item[0].trim()] = item[1]
		})
	} catch (e) {
		console.log('compileCookie:', e)
		return e
	}
	return obj;
}

/**
 * 签到
 * @returns {Promise<object>}
 */
async function checkIn() {
	let check_in;
	try {
		check_in = await requestFetch("https://go.tofly.cyou/user/checkin", {
			headers,
			method: "POST"
		})
		/*eg: {"msg":"\u83b7\u5f97\u4e86 495MB \u6d41\u91cf.","unflowtraffic":3537895424,"traffic":"3.29GB","trafficInfo":{"todayUsedTraffic":"0B","lastUsedTraffic":"142.77MB","unUsedTraffic":"3.16GB"},"ret":1}*/
	} catch (e) {
		console.error('e1:', e)
		try {
			check_in = await requestFetch("https://w1.v2dns.xyz/user/checkin", {
				headers,
				method: "POST"
			})
		} catch (e) {
			console.log("e2:", e)
			throw e
		}
	}
	Object.assign(v2freeData, check_in)
	return v2freeData
}

/**
 * 获取发送邮件之后的状态
 * @param traffic { string }
 * @param msg { string }
 * @param lastUsedTraffic {string}
 * @param todayUsedTraffic { string}
 * @param unUsedTraffic {string}
 * @returns {Promise<void>}
 */
async function getMsgStatus({traffic = '', msg, trafficInfo: {lastUsedTraffic, todayUsedTraffic, unUsedTraffic}}) {
	const params = {
		from: v2freeData.title,
		to,
		subject: v2freeData.h1 + (v2freeData.status),
		html: null
	}
	let html = '<h1 style="text-align: center">自动签到通知</h1>';
	const obj = compileCookie(cookie);
	if (obj.email) {
		try {
			obj.email = decodeURIComponent(obj.email);
		} catch (e) {
			console.log('decodeURIComponent:', e)
			throw e
		}
		html += `
			<p  style="text-indent: 2em">签到账号${obj.email}</p>
		`
	}
	html += `
        <p style="text-indent: 2em">签到结果：${msg}</p>
	`
	if (traffic) {
		html += `
			<p  style="text-indent: 2em">全部获得${traffic}</p>
			<p  style="text-indent: 2em">已使用${lastUsedTraffic}</p>
			<p  style="text-indent: 2em">今日使用${todayUsedTraffic}</p>
			<p  style="text-indent: 2em">签到之前剩余${unUsedTraffic}</p>
		`
	}
	params.html = html;
	return sendMail(params)
}

(async function () {
	const repData = await checkIn()
	try {
		await getMsgStatus(repData);
	} catch (e) {
		console.error('getMsgStatus:', v2freeData.error)
	}
})()
