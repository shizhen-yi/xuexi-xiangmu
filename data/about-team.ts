export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
};

export const teamMembers: readonly TeamMember[] = [
  {
    id: "lin-mara",
    name: "Mara Lin",
    role: "Creative Director",
    bio: "从动态字体到沉浸空间，Mara 关注观念如何被光、节奏与界面组织成可感知的叙事，擅长把抽象命题转译为清晰的视觉系统。",
    avatar: "https://picsum.photos/seed/lin-mara/400/400",
  },
  {
    id: "zhou-elliot",
    name: "Elliot Zhou",
    role: "Tech Lead",
    bio: "Elliot 负责把实验性想法落到稳定架构，熟悉实时渲染、交互状态与内容管线，在性能边界内保留作品的呼吸感与细腻层次。",
    avatar: "https://picsum.photos/seed/zhou-elliot/400/400",
  },
  {
    id: "shen-nora",
    name: "Nora Shen",
    role: "WebGL Engineer",
    bio: "Nora 以着色器和几何算法构建浏览器中的流动画面，偏爱简洁数学、低噪纹理与对输入变化保持敏感的实时反馈关系。",
    avatar: "https://picsum.photos/seed/shen-nora/400/400",
  },
  {
    id: "huang-isaac",
    name: "Isaac Huang",
    role: "Sound Designer",
    bio: "Isaac 将声音视为界面的隐藏结构，使用颗粒合成、场录和空间混响，为视觉运动补足速度、距离与材料质感线索层次。",
    avatar: "https://picsum.photos/seed/huang-isaac/400/400",
  },
  {
    id: "wu-celeste",
    name: "Celeste Wu",
    role: "3D Generalist",
    bio: "Celeste 在模型、材质与灯光之间寻找平衡，善于用克制的形体和表面细节，让数字物体呈现介于工业与梦境之间的重量。",
    avatar: "https://picsum.photos/seed/wu-celeste/400/400",
  },
  {
    id: "gao-riven",
    name: "Riven Gao",
    role: "Producer",
    bio: "Riven 统筹创意、工程与发布节奏，关注每个原型从概念、验证到上线的路径，确保实验项目仍具备明确的交付形态边界。",
    avatar: "https://picsum.photos/seed/gao-riven/400/400",
  },
];

export function getMemberById(id: string): TeamMember | undefined {
  return teamMembers.find((member) => member.id === id);
}
