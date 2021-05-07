export class Bot extends Function {
    constructor(options) {
        super();
        this.url = options.url;
        this.token = options.token;
        this.on_event = {}
        this.receive = {}
        return new Proxy(this, {
            apply: (target, ctx, args) => target.__call(ctx, ...args)
        })
    }
    connect() {
        this.conn = {
            'api': new WebSocket(`${this.url}/api?access_token=${this.token}`),
            'event': new WebSocket(`${this.url}/event?access_token=${this.token}`),
        }
        const context = this;
        this.conn.api.onopen = function (e) {
            if (!context.ready)
                context.ready = true;
            else context.on_event['ready']();
        };
        this.conn.api.onmessage = function (e) {
            let data = JSON.parse(e.data);
            context.receive[data.echo] = data;
        }
        this.conn.event.onopen = function (e) {
            if (!context.ready)
                context.ready = true;
            else context.on_event['ready'](context);
        }
        this.conn.event.onmessage = function (e) {
            let data = JSON.parse(e.data);
            console.log(data.message)
            if (data.post_type === 'message') {
                if (context.on_event['message.' + data.message_type] !== undefined) {
                    context.on_event['message.'+data.message_type](context, data, data.message)
                }
            }
        }
    }
    on(e, func) {
        this.on_event[e] = func;
    }
    __call(ctx, action, options) {
        const context = this;
        return new Promise(function (resolve) {
            let stamp = Math.random();
            context.conn.api.send(JSON.stringify({
                "action": action,
                "params": options,
                "echo": stamp
            }))
            setTimeout(() => {
                resolve(context.receive[stamp]);
                delete context.receive[stamp]
            }, 100);
        });
    }
}