// Inspirational quotes for Focus and Meditation modes

export interface Quote {
  text: string;
  author: string;
}

export const focusQuotes: Quote[] = [
  { text: "Tập trung là nói không với hàng ngàn ý tưởng tốt khác.", author: "Steve Jobs" },
  { text: "Nơi tập trung đi, năng lượng sẽ theo.", author: "Tony Robbins" },
  { text: "Thành công đòi hỏi sự tập trung nhất tâm.", author: "Vince Lombardi" },
  { text: "Điều quan trọng nhất là không ngừng đặt câu hỏi.", author: "Albert Einstein" },
  { text: "Hãy làm việc chăm chỉ trong im lặng, để thành công tạo nên tiếng vang.", author: "Frank Ocean" },
  { text: "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", author: "Jim Rohn" },
  { text: "Bạn không cần phải vĩ đại để bắt đầu, nhưng bạn phải bắt đầu để trở nên vĩ đại.", author: "Zig Ziglar" },
  { text: "Một bước nhỏ mỗi ngày sẽ dẫn đến những thay đổi lớn.", author: "Khuyết danh" },
  { text: "Sự tập trung không phải về việc nói có. Mà là nói không với những thứ không quan trọng.", author: "Warren Buffett" },
  { text: "Hành trình ngàn dặm bắt đầu từ một bước chân.", author: "Lão Tử" },
];

export const meditationQuotes: Quote[] = [
  { text: "Hít thở là cầu nối giữa tâm trí và cơ thể.", author: "Thích Nhất Hạnh" },
  { text: "Bình yên đến từ bên trong. Đừng tìm kiếm nó bên ngoài.", author: "Đức Phật" },
  { text: "Tâm tĩnh lặng, vạn sự an.", author: "Khuyết danh" },
  { text: "Thiền không phải trốn tránh thực tại, mà là nhìn thấy thực tại rõ ràng hơn.", author: "Thích Nhất Hạnh" },
  { text: "Trong tĩnh lặng, ta tìm thấy chính mình.", author: "Khuyết danh" },
  { text: "Hãy để tâm trí nghỉ ngơi, như mặt hồ phẳng lặng.", author: "Khuyết danh" },
  { text: "Mỗi hơi thở là một cơ hội để bắt đầu lại.", author: "Khuyết danh" },
  { text: "Sự bình yên không phải là không có bão tố, mà là bình tĩnh giữa bão tố.", author: "Khuyết danh" },
  { text: "Thiền định là về việc nhìn thấy rõ ràng, không phải về việc không suy nghĩ.", author: "Sam Harris" },
  { text: "Hãy ở đây, ngay bây giờ.", author: "Ram Dass" },
];

export function getRandomQuote(mode: 'focus' | 'meditation'): Quote {
  const quotes = mode === 'focus' ? focusQuotes : meditationQuotes;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
