/**
 * 手机内置指令库系统
 * 目标：摆脱酒馆依赖，手机独立运行所有功能
 */

class MobileCommandLibrary {
  constructor() {
    this.commands = new Map();
    this.apiConfig = null;
    this.isInitialized = false;
    this.chatHistory = [];
    
    this.init();
  }

  async init() {
    console.log('[MobileCommand] 初始化手机内置指令库...');
    
    // 加载API配置（使用现有的手机API配置功能）
    this.loadAPIConfig();
    
    // 初始化内置指令库
    this.initBuiltInCommands();
    
    // 挂载到全局
    window.mobileCommandLibrary = this;
    
    this.isInitialized = true;
    console.log('[MobileCommand] ✅ 手机指令库初始化完成');
  }

  // ==================== API配置管理 ====================
  
  loadAPIConfig() {
    // 复用现有的手机API配置
    if (window.mobileCustomAPIConfig) {
      this.apiConfig = window.mobileCustomAPIConfig;
      console.log('[MobileCommand] 使用现有手机API配置');
    } else {
      console.warn('[MobileCommand] 手机API配置未找到');
    }
  }

  // 调用手机配置的API
  async callMobileAPI(messages, options = {}) {
    if (!this.apiConfig || !this.apiConfig.callAPI) {
      throw new Error('手机API配置未就绪');
    }
    
    try {
      const response = await this.apiConfig.callAPI(messages, options);
      return response;
    } catch (error) {
      console.error('[MobileCommand] API调用失败:', error);
      throw error;
    }
  }

  // ==================== 聊天记录管理 ====================
  
  // 获取最近的聊天记录
  getRecentChatHistory(limit = 10) {
    try {
      // 从SillyTavern的聊天区域获取消息
      const chatMessages = document.querySelectorAll('#chat .mes');
      const messages = [];
      
      // 获取最近的几条消息
      const recentMessages = Array.from(chatMessages).slice(-limit);
      
      recentMessages.forEach(mesElement => {
        const nameElement = mesElement.querySelector('.name_text');
        const textElement = mesElement.querySelector('.mes_text');
        
        if (nameElement && textElement) {
          const name = nameElement.textContent.trim();
          const text = textElement.textContent.trim();
          messages.push(`${name}: ${text}`);
        }
      });
      
      return messages.join('\n\n');
    } catch (error) {
      console.error('[MobileCommand] 获取聊天记录失败:', error);
      return '暂无聊天记录';
    }
  }

  // ==================== 内置指令库 ====================
  
  initBuiltInCommands() {
    console.log('[MobileCommand] 加载内置指令库...');
    
    // 论坛相关指令
    this.addCommand('generate_forum', {
      name: '生成论坛内容',
      description: '根据聊天记录生成论坛风格的帖子和回复',
      systemPrompt: '你是一位常年混迹于各大论坛的老网民，擅长将聊天对话转化为论坛风格的讨论。请根据提供的聊天记录，生成3-5个论坛帖子，每个帖子包含标题、主楼内容和2-4条回复。风格要求：标题要有话题性，内容贴近网民日常，回复体现不同观点，用词自然符合论坛文化。请直接生成论坛内容，不要解释。',
      userPrompt: (chatHistory) => `请根据以下聊天记录生成论坛讨论：\n\n${chatHistory}`
    });

    // 微博相关指令
    this.addCommand('generate_weibo', {
      name: '生成微博内容', 
      description: '根据聊天记录生成微博风格的动态',
      systemPrompt: '你是一位活跃的微博博主，善于将生活片段转化为有趣的微博内容。请根据提供的聊天记录，生成3-5条微博，每条包含正文、话题标签和2-3条评论互动。风格要求：语言轻松有趣，适当使用emoji表情，包含相关话题标签，评论自然体现互动感，内容积极正面。请直接生成微博内容，不要解释。',
      userPrompt: (chatHistory) => `请根据以下聊天记录生成微博动态：\n\n${chatHistory}`
    });

    // 购物推荐指令
    this.addCommand('generate_shop', {
      name: '生成购物推荐',
      description: '根据对话内容生成相关商品推荐',
      systemPrompt: '你是一位经验丰富的购物顾问，能够根据聊天内容推荐合适的商品。请根据提供的聊天记录，生成5-8个商品推荐，每个商品包含[商品|商品名称|价格|类型|描述]格式。要求：商品要与聊天内容相关，价格合理符合市场行情，描述简洁有吸引力，类型分类准确。请直接生成商品信息，不要解释。',
      userPrompt: (chatHistory) => `请根据以下聊天内容推荐相关商品：\n\n${chatHistory}`
    });

    // 任务生成指令  
    this.addCommand('generate_tasks', {
      name: '生成任务列表',
      description: '根据对话生成相关任务',
      systemPrompt: '你是一位任务管理专家，能够根据对话内容生成合理的任务安排。请根据提供的聊天记录，生成3-6个相关任务，每个任务包含[任务|任务ID|任务名称|描述|发布者|奖励]格式。要求：任务要与对话内容相关，难度适中可执行性强，奖励合理有吸引力，任务描述清晰具体，ID使用4位数字。请直接生成任务信息，不要解释。',
      userPrompt: (chatHistory) => `请根据以下对话内容生成相关任务：\n\n${chatHistory}`
    });

    // 背包物品指令
    this.addCommand('generate_backpack', {
      name: '生成背包物品',
      description: '根据对话生成相关物品',
      systemPrompt: '你是一位游戏物品设计师，能够根据对话内容设计相关的虚拟物品。请根据提供的聊天记录，生成5-10个相关物品，每个物品包含[背包|物品名称|物品类型|描述|数量]格式。物品类型包括：装备、道具、材料、消耗品、特殊物品等。要求：物品要与对话内容相关，名称有创意且合理，描述生动有趣，数量符合逻辑，类型分类准确。请直接生成物品信息，不要解释。',
      userPrompt: (chatHistory) => `请根据以下对话内容生成相关背包物品：\n\n${chatHistory}`
    });

    // 直播内容指令
    this.addCommand('generate_live', {
      name: '生成直播内容',
      description: '根据对话生成直播相关内容',
      systemPrompt: '你是一位直播策划专家，能够根据对话内容设计直播场景和互动内容。请根据提供的聊天记录，生成直播相关内容，包含：1.直播间信息[直播|直播间名称|主播用户名|直播类别|观看人数]，2.弹幕[弹幕|用户名|弹幕内容]，3.礼物[礼物|用户名|礼物名称|数量]。要求：内容要与对话主题相关，弹幕要自然真实，礼物名称有创意。请直接生成直播内容，不要解释。',
      userPrompt: (chatHistory) => `请根据以下对话内容生成直播相关内容：\n\n${chatHistory}`
    });
  }

  // ==================== 指令管理 ====================
  
  // 添加指令
  addCommand(key, command) {
    this.commands.set(key, command);
    console.log(`[MobileCommand] 已添加指令: ${command.name}`);
  }

  // 获取指令
  getCommand(key) {
    return this.commands.get(key);
  }

  // 获取所有指令
  getAllCommands() {
    return Array.from(this.commands.entries());
  }

  // ==================== 核心执行方法 ====================
  
  // 执行指令 - 这是核心方法，替代原来的酒馆API调用
  async executeCommand(commandKey, customChatHistory = null) {
    try {
      console.log(`[MobileCommand] 执行指令: ${commandKey}`);
      
      const command = this.getCommand(commandKey);
      if (!command) {
        throw new Error(`未找到指令: ${commandKey}`);
      }

      // 获取聊天记录
      const chatHistory = customChatHistory || this.getRecentChatHistory();
      if (!chatHistory || chatHistory === '暂无聊天记录') {
        throw new Error('无法获取聊天记录');
      }

      // 构建消息
      const messages = [
        {
          role: 'system',
          content: command.systemPrompt
        },
        {
          role: 'user', 
          content: command.userPrompt(chatHistory)
        }
      ];

      // 调用手机API
      const response = await this.callMobileAPI(messages);
      
      console.log(`[MobileCommand] 指令执行成功: ${commandKey}`);
      return response;

    } catch (error) {
      console.error(`[MobileCommand] 指令执行失败: ${commandKey}`, error);
      throw error;
    }
  }

  // ==================== 手机应用集成方法 ====================
  
  // 为论坛应用提供内容生成
  async generateForumContent() {
    try {
      const response = await this.executeCommand('generate_forum');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('forum', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 论坛内容生成失败:', error);
      throw error;
    }
  }

  // 为微博应用提供内容生成
  async generateWeiboContent() {
    try {
      const response = await this.executeCommand('generate_weibo');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('weibo', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 微博内容生成失败:', error);
      throw error;
    }
  }

  // 为购物应用提供商品推荐
  async generateShopRecommendations() {
    try {
      const response = await this.executeCommand('generate_shop');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('shop', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 购物推荐生成失败:', error);
      throw error;
    }
  }

  // 为任务应用提供任务生成
  async generateTasks() {
    try {
      const response = await this.executeCommand('generate_tasks');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('task', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 任务生成失败:', error);
      throw error;
    }
  }

  // 为背包应用提供物品生成
  async generateBackpackItems() {
    try {
      const response = await this.executeCommand('generate_backpack');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('backpack', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 背包物品生成失败:', error);
      throw error;
    }
  }

  // 为直播应用提供内容生成
  async generateLiveContent() {
    try {
      const response = await this.executeCommand('generate_live');
      // 直接在手机内显示，不发送到酒馆
      this.displayInMobileApp('live', response.content);
      return response.content;
    } catch (error) {
      console.error('[MobileCommand] 直播内容生成失败:', error);
      throw error;
    }
  }

  // ==================== 手机内容显示方法 ====================
  
  // 在手机应用内显示内容，不发送到酒馆
  displayInMobileApp(appType, content) {
    console.log(`[MobileCommand] 在手机${appType}应用内显示内容`);
    
    try {
      // 根据应用类型调用对应的显示方法
      switch (appType) {
        case 'forum':
          if (window.forumUI && window.forumUI.displayGeneratedContent) {
            window.forumUI.displayGeneratedContent(content);
          }
          break;
        case 'weibo':
          if (window.weiboUI && window.weiboUI.displayGeneratedContent) {
            window.weiboUI.displayGeneratedContent(content);
          }
          break;
        case 'shop':
          if (window.shopApp && window.shopApp.displayRecommendations) {
            window.shopApp.displayRecommendations(content);
          }
          break;
        case 'task':
          if (window.taskApp && window.taskApp.displayTasks) {
            window.taskApp.displayTasks(content);
          }
          break;
        case 'backpack':
          if (window.backpackApp && window.backpackApp.displayItems) {
            window.backpackApp.displayItems(content);
          }
          break;
        case 'live':
          if (window.liveApp && window.liveApp.displayContent) {
            window.liveApp.displayContent(content);
          }
          break;
        default:
          console.warn(`[MobileCommand] 未知应用类型: ${appType}`);
      }
    } catch (error) {
      console.error(`[MobileCommand] 显示内容失败: ${appType}`, error);
    }
  }

  // ==================== 工具方法 ====================
  
  // 检查是否已初始化
  isReady() {
    return this.isInitialized && this.apiConfig && this.apiConfig.callAPI;
  }

  // 获取状态信息
  getStatus() {
    return {
      initialized: this.isInitialized,
      apiConfigReady: !!(this.apiConfig && this.apiConfig.callAPI),
      commandsCount: this.commands.size
    };
  }
}

// 自动初始化
(() => {
  // 等待页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new MobileCommandLibrary();
    });
  } else {
    new MobileCommandLibrary();
  }
})();
