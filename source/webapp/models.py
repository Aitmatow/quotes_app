from django.db import models

QUOTE_NEW = 'new'
QUOTE_APPROVED = 'approved'
QUOTE_STATUS_CHOICES = (
    (QUOTE_NEW, 'Новая'),
    (QUOTE_APPROVED, 'Подтверждена')
)

# Create your models here.
class Quote(models.Model):
    text = models.TextField(max_length=2000, verbose_name='Текст цитаты')
    created_at = models.DateTimeField(auto_now=True, verbose_name='Дата добавления')
    status = models.CharField(max_length=20, choices=QUOTE_STATUS_CHOICES, default=QUOTE_NEW, verbose_name='Статус')
    author_name = models.CharField(max_length=50, verbose_name='Кто добавил')
    author_email = models.EmailField(verbose_name='Email')
    rating = models.IntegerField(default=0, verbose_name='Рейтинг')

    def __str__(self):
        return self.text[:20] + '....'

    class Meta:
        verbose_name = 'Цитата'
        verbose_name_plural = 'Цитаты'