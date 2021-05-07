import Vue from 'vue'
import App from './App'
import router from './router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Table, TableColumn } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueSimpleMarkdown from 'vue-simple-markdown'
import 'vue-simple-markdown/dist/vue-simple-markdown.css'
import vueSmoothScroll from 'vue2-smooth-scroll'
import utils from './utils'

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false

Vue.use(vueSmoothScroll);
Vue.use(VueSimpleMarkdown);
Vue.use(Table);
Vue.use(TableColumn);
for (var k in utils)
  Vue.prototype[k] = utils[k]

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
