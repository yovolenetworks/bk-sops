<template>
    <div class="page-view">
        <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad">
            <div class="panel-list">
                <van-cell
                    v-for="item in list"
                    :to="`/template/?bizId=${item.cc_id}`"
                    :key="item.cc_id"
                    :title="item.cc_name">
                    <template slot="title">
                        <van-tag color="false" :class="item.tagColor">{{ item.tag }}</van-tag>
                        <span class="title">{{ item.cc_name }}</span>
                    </template>
                </van-cell>
            </div>
        </van-list>
    </div>
</template>
<script>
    import { getBusinessList } from '@/store/modules/businessList'

    const BIZ_TAG_COLORS = ['blue', 'red', 'orange', 'green', 'gray']

    export default {
        name: 'home',
        props: { title: String },

        data () {
            return {
                list: [],
                loading: false,
                finished: false
            }
        },
        methods: {
            onLoad () {
                // 异步更新数据
                setTimeout(() => {
                    const bizList = getBusinessList()['objects']
                    const _this = this
                    bizList.forEach(item => {
                        ({ tagColor: item.tagColor, tag: item.tag } = this.getTagColor(item))
                        _this.list.push(item)
                    })

                    // 加载状态结束
                    this.loading = false

                    // 数据全部加载完成
                    if (this.list.length >= bizList.length) {
                        this.finished = true
                    }
                }, 500)
            },

            getTagColor (biz) {
                // tag颜色分布 1-5号色值，保存在cookie里面
                const tagColor = this.$cookies.get(biz.cc_id)
                const [tag] = biz.cc_name
                if (tagColor) {
                    return { tagColor: tagColor, tag: tag }
                } else {
                    const color = parseInt(Math.random() * 4, 10) + 1
                    const tagColor = `tag-${BIZ_TAG_COLORS[color]}`
                    this.$cookies.set(biz.cc_id, tagColor)
                    return { tagColor: tagColor, tag: tag }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../../static/style/app.scss';
    .page-view {
        .van-cell {
            background-color: $white;
            height: 90px;
            margin: 20px 25px;
            width: auto;
            border-radius: 10px;
            padding: 15px;
            &:after{
                border-bottom: none;
            }
            .van-tag {
                width: 60px;
                height: 60px;
                line-height: 60px;
                border-radius: 4px;
                text-align: center;
                display: inline-block;
                padding: 0;
                font-size: 28px;
                color: $white;
                vertical-align: middle;
            }
            .tag-blue {
                background-color: #3A84FF;
            }
            .tag-red {
                background-color: #EA3636;
            }
            .tag-orange {
                background-color: #FF9C01;
            }
            .tag-green {
                background-color: #2DCB56;
            }
            .tag-gray {
                background-color: #C4C6CC;
            }
            .title {
                font-size: $fs-16;
                font-weight: bold;
                margin-left: 10px;
                color: $black;
                vertical-align: middle;
            }
        }
    }
</style>
