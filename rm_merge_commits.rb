#!/usr/bin/ruby
old_parents = gets.chomp.gsub('-p ', ' ')

new_parents =
  if old_parents.empty?
    []
  else
    `git show-branch --independent #{old_parents}`.split
  end

puts new_parents.map { |p| '-p ' + p }.join(' ')
