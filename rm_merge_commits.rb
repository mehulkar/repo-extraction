#!/usr/bin/ruby
old_parents = gets.chomp.gsub('-p ', ' ')

if old_parents.empty?
  new_parents = []
else
  new_parents = `git show-branch --independent #{old_parents}`.split
end

puts new_parents.map { |p| '-p ' + p }.join(' ')
