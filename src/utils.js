function htmlentities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var registry = {
    'text': (e) => htmlentities(e.text).replace(/\n/g, '<br>'),
    'image': (e) => `<img src="${e.url}" style="max-width:600px;width:100%" />`,
};

module.exports = {
    get_avatar: (id, type = 'friend') => {
        switch (type) {
            case 'friend':
                return `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=640`;
            case 'group':
                return `http://p.qlogo.cn/gh/${id}/${id}/0`;
        }
    },
    parse: function (message) {
        if (message.length === 0 || message.length === undefined)
            return;
        var ret = '';
        message.forEach(element => {
            if (registry[element.type] !== undefined)
                ret += registry[element.type](element.data);
        });
        return ret;
    },
    render: function (message) {
        return message;
    },
};
