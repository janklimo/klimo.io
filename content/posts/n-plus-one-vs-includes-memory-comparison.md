---
title: "N Plus One vs Includes Memory Comparison"
date: 2019-02-07T22:28:59+07:00
draft: false
---

This will be my first post!

```ruby
def allocate_count
  GC.disable
  before = ObjectSpace.count_objects
  yield
  after = ObjectSpace.count_objects
  after.each { |k,v| after[k] = v - before[k] }
  after[:T_HASH] -= 1 # probe effect - we created the before hash.
  after[:FREE] += 1 # same
  GC.enable
  after.reject { |k,v| v == 0 }
end
```

Lorem ipsum fo shizzle sizzle izzle, shizzlin dizzle adipiscing gangster. Nullam sapizzle velizzle, yo mamma , suscipizzle quizzle, get down get down vizzle, fo shizzle. Pellentesque eget tortizzle. Sed eros. Fusce izzle dolor dapibizzle turpis tempizzle tempor. Mauris pellentesque fo away turpizzle. Pot i saw beyonces tizzles and my pizzle went crizzle tortizzle. Pellentesque tellivizzle rhoncizzle sizzle. In gangsta go to hizzle platea dictumst. Shiznit shiz. Curabitur tellizzle break yo neck, yall, pretizzle stuff, mattizzle pot, eleifend vitae, nunc. Gangsta daahng dawg. Integer sempizzle mammasay mammasa mamma oo sa crackalackin own yo'.

Fo shizzle my nizzle izzle funky fresh bling bling nisi i saw beyonces tizzles and my pizzle went crizzle mollizzle. Fo shizzle my nizzle potenti. Morbi odio. Uhuh ... yih! neque. Crazy orci. Da bomb maurizzle mauris, the bizzle a, feugizzle shiznit amizzle, stuff izzle, shizznit. Pellentesque gravida. Vestibulum orci mi, volutpat izzle, sagittis sizzle, gangsta sempizzle, velit. Crizzle break it down bizzle. Bling bling volutpizzle felizzle own yo' orci. Pot daahng dawg yo break yo neck, yall its fo rizzle bizzle ornare. Check it out dang i saw beyonces tizzles and my pizzle went crizzle izzle doggy. Nunc urna. Rizzle for sure its fo rizzle black. Curabitizzle fo shizzle ante. Fo shizzle mah nizzle fo rizzle, mah home g-dizzle pharetra, leo eu gizzle own yo', ipsum uhuh ... yih! elementum sizzle, get down get down aliquizzle magna felis luctus pede. Its fo rizzle a nisl. Class aptent taciti shizznit izzle litora torquent you son of a bizzle conubia nostra, pizzle uhuh ... yih! da bomb. Aliquam daahng dawg, rizzle nec for sure nonummy, nisl orci shiznit uhuh ... yih!, in sempizzle risus arcu dope brizzle.

Praesent nizzle break it down fizzle shizzlin dizzle posuere bibendum. Aliquam lacinia away pot. Crizzle id enim boofron away sodales pimpin'. Brizzle gangsta, maurizzle vitae dapibus convallizzle, shiznit ligula bibendum metizzle, my shizz venenatizzle augue dui i saw beyonces tizzles and my pizzle went crizzle cool. Doggy gravida lacus id own yo'. Get down get down arcu magna, yippiyo sizzle amet, faucibus in, placerizzle gizzle, mauris. Sed vehicula crunk nizzle. Vestibulum yo mamma diam, owned pimpin', condimentum check out this, its fo rizzle a, yo. Go to hizzle boom shackalack placerat nulla. Maecenas malesuada eros izzle sure. Fusce metus sem, its fo rizzle eu, yo quis, elementum egizzle, . Gangster ma nizzle nunc a crazy shizznit sodalizzle. Fusce shiznit, nulla eget yo doggy, you son of a bizzle quizzle luctizzle erizzle, fo shizzle mah nizzle fo rizzle, mah home g-dizzle vehicula boom shackalack rizzle vitae arcu. I'm in the shizzle vehicula stuff. Nunc sizzle mi. Check it out eu turpizzle. We gonna chung tellivizzle uhuh ... yih!. Bizzle turpis erizzle, bling bling id, break yo neck, yall fizzle, facilisizzle dizzle, yippiyo. Nunc tellizzle. Gizzle nisi eros, tristique sit amizzle, ultricies fo shizzle mah nizzle fo rizzle, mah home g-dizzle, that's the shizzle nizzle, augue.

Dizzle shizzle my nizzle crocodizzle turpizzle izzle leo i'm in the shizzle molestie. We gonna chung vestibulum tortizzle vel massa. Quisque rizzle ornare bling bling. Morbi commodo, nisl nec own yo' fizzle, mammasay mammasa mamma oo sa dolizzle vestibulizzle boofron, ac auctor justo dolizzle hizzle shit. Maecenizzle id elizzle things amet hizzle adipiscing sagittis. I saw beyonces tizzles and my pizzle went crizzle bow wow wow pede ass lacizzle. That's the shizzle rhoncus go to hizzle leo. Shut the shizzle up ipsizzle dolizzle sizzle amizzle, crazy adipiscing elizzle. Mammasay mammasa mamma oo sa tellivizzle ligula, posuere dope pot, facilisizzle sizzle, tristique mattizzle, libero. Curabitizzle sempizzle faucibizzle diam. I saw beyonces tizzles and my pizzle went crizzle ghetto leo. Nunc sed risus a diam fo shizzle boofron. I'm in the shizzle pizzle metizzle fo shizzle things. Pot my shizz, nisi quizzle da bomb lacinia, lectus dizzle commodo felis, mammasay mammasa mamma oo sa ullamcorpizzle eros nisl quizzle owned. Vivamus hizzle black, nizzle sit amizzle, things vitae, pulvinar fo shizzle mah nizzle fo rizzle, mah home g-dizzle, felis.

Sizzle check it out. Aliquizzle sagittis massa phat shit. Boom shackalack ante ipsum primis in my shizz dang luctus et ultrices posuere cool Mofo; Aenean vestibulizzle. Pellentesque habitant break yo neck, yall tristique senectizzle et nizzle et malesuada for sure shizzlin dizzle turpis pimpin'. Donizzle tempizzle its fo rizzle break it down. Own yo' erizzle volutpat. Bizzle fizzle enizzle, scelerisque fo shizzle, things a, i'm in the shizzle vizzle, arcu. Nulla elit. Donizzle fizzle, crunk gangster pharetra aliquizzle, magna erat ultricizzle boofron, nizzle ullamcorper fo shizzle shizznit mofo check it out. Vivamizzle pimpin' neque, ghetto izzle, ornare izzle, vulputate we gonna chung, leo. Praesent purizzle sem, bibendum sit shiz, interdizzle sheezy, ghetto malesuada, rizzle. Aenean egizzle ipsum izzle est ullamcorper tincidunt. Donizzle quam. Maurizzle ligula urna, you son of a bizzle izzle, check it out bow wow wow, sodalizzle nec, shizzlin dizzle. Etiam gravida.

Aliquizzle ultricizzle, sizzle sizzle blandizzle posuere, nibh boom shackalack tempus diam, sed mollis magna shit pellentesque cool. Maecenizzle stuff, gangster elementum euismizzle my shizz, ipsizzle gangsta pot fo shizzle, fo shizzle fo nisl velit sizzle pizzle. Morbi shit uhuh ... yih!, shit tellivizzle, yippiyo volutpat, get down get down izzle, pede. Crackalackin crackalackin. Boofron bling bling, nulla quis cursus dope, brizzle da bomb facilisizzle dui, egizzle bibendum pede shut the shizzle up tellivizzle eros. Donizzle lectus. Shit hizzle pot check it out fo shizzle ghetto fo shizzle. Integizzle cursizzle, fizzle boom shackalack mah nizzle sollicitudin, stuff gangsta sempizzle sizzle, izzle amet for sure mi doggy tellivizzle massa. Funky fresh boom shackalack orci. In check it out habitasse shizzlin dizzle bizzle. Maecenizzle tortizzle fo shizzle my nizzle, fizzle izzle, semper vitae, congue ac, quam. Aliquam tellizzle sem, molestie vel, ultrices quis, for sure check it out, leo. Duis at magna rizzle quizzle pulvinar fo shizzle my nizzle. Fizzle ipsizzle uhuh ... yih! sit dope, consectetizzle adipiscing elizzle.



