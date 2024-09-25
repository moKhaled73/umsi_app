function showContent(contentId) {
    // إخفاء كل المحتويات
    var contents = document.querySelectorAll('.content');
    contents.forEach(function(content) {
        content.classList.remove('active');  // إزالة الفئة 'active' من جميع المحتويات
        content.style.display = 'none';      // إخفاء المحتويات
    });

    // إظهار المحتوى الذي تم النقر عليه فقط
    var selectedContent = document.getElementById(contentId);
    selectedContent.classList.add('active');
    selectedContent.style.display = 'block'; // عرض المحتوى النشط فقط

    // تحديث الحالة النشطة في قائمة العناصر (li)
    var items = document.querySelectorAll('.guideline li');
    items.forEach(function(item) {
        item.classList.remove('active'); // إزالة الفئة 'active' من جميع العناصر
    });

    // إضافة الفئة 'active' للعنصر المحدد
    event.target.classList.add('active');
}
