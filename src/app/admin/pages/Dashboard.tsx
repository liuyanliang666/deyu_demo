import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageSquareWarning, 
  Clock, 
  ArrowUpRight, 
  Activity
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// 模拟图表数据
const chartData = [
  { name: "Mon", total: 45, alert: 2 },
  { name: "Tue", total: 82, alert: 1 },
  { name: "Wed", total: 126, alert: 5 },
  { name: "Thu", total: 98, alert: 2 },
  { name: "Fri", total: 152, alert: 4 },
  { name: "Sat", total: 64, alert: 1 },
  { name: "Sun", total: 40, alert: 0 },
];

// 模拟预警列表数据
const recentAlerts = [
  { id: 1, student: "李明", class: "高一(2)班", content: "提到了'不想上学'", level: "high", time: "10分钟前" },
  { id: 2, student: "王小红", class: "初二(1)班", content: "持续询问家庭矛盾", level: "medium", time: "2小时前" },
  { id: 3, student: "张伟", class: "高三(5)班", content: "深夜高频对话", level: "low", time: "5小时前" },
  { id: 4, student: "刘洋", class: "高一(2)班", content: "情绪关键词检测", level: "medium", time: "昨天" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部欢迎语 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">德育驾驶舱</h2>
          <p className="text-muted-foreground mt-1">
            实时监测学生心理动态与对话活跃度
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">
             <Activity className="mr-2 h-4 w-4" /> 导出周报
           </Button>
           <Button size="sm" className="bg-primary hover:bg-primary/90">
             刷新数据
           </Button>
        </div>
      </div>
      
      {/* 核心指标卡片组 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 卡片 1 */}
        <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">今日活跃学生</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">128</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                    +12% <ArrowUpRight className="h-3 w-3 ml-0.5"/>
                </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">占全校学生 15%</p>
          </CardContent>
        </Card>

        {/* 卡片 2 */}
        <Card className="overflow-hidden border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">需关注预警</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <MessageSquareWarning className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">3</span>
                <span className="text-xs font-medium text-red-600 flex items-center bg-red-50 px-1.5 py-0.5 rounded-full">
                    1 高风险
                </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">较昨日减少 2 条</p>
          </CardContent>
        </Card>

        {/* 卡片 3 */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">累计辅导时长</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">42.5h</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center">
                    +2.4h <ArrowUpRight className="h-3 w-3 ml-0.5"/>
                </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">相当于 5 位老师的工作量</p>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区：图表 + 列表 */}
      <div className="grid gap-4 md:grid-cols-7">
        
        {/* 左侧：趋势图表 (占据 4/7 宽度) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>对话活跃趋势</CardTitle>
            <CardDescription>近7天学生与AI互动的对话数量统计</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8883ba" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8883ba" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#8883ba" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：预警动态 (占据 3/7 宽度) */}
        <Card className="col-span-3 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                实时动态 
                <Badge variant="outline" className="font-normal">最新5条</Badge>
            </CardTitle>
            <CardDescription>需要关注的学生互动记录</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
                {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 group cursor-pointer">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.student}`} />
                            <AvatarFallback>{alert.student[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">
                                    {alert.student} 
                                    <span className="text-xs text-muted-foreground font-normal ml-2">{alert.class}</span>
                                </p>
                                <span className="text-xs text-muted-foreground">{alert.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {alert.content}
                            </p>
                        </div>
                        {/* 风险等级标签 */}
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            alert.level === 'high' ? 'bg-red-500 shadow-sm shadow-red-200' : 
                            alert.level === 'medium' ? 'bg-orange-400' : 'bg-slate-300'
                        }`} />
                    </div>
                ))}
            </div>
          </CardContent>
          {/* 底部按钮 */}
          <div className="p-4 border-t mt-auto">
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary">
                查看全部记录 <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
